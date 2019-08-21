import { gql } from '../../jest/helpers'
import Factory from '../../seed/factories'
import { createTestClient } from 'apollo-server-testing'
import { neode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const factory = Factory()
const driver = getDriver()
const instance = neode()
let server
let query
let mutate
let user
let authenticatedUser

beforeAll(() => {
  const createServerResult = createServer({
    context: () => {
      return {
        user: authenticatedUser,
        neode: instance,
        driver,
      }
    },
  })
  server = createServerResult.server
  const createTestClientResult = createTestClient(server)
  query = createTestClientResult.query
  mutate = createTestClientResult.mutate
})

beforeEach(async () => {
  user = await instance.create('User', {
    id: 'you',
    name: 'Al Capone',
    slug: 'al-capone',
    email: 'test@example.org',
    password: '1234',
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('notifications', () => {
  const notificationQuery = gql`
    query($read: Boolean) {
      currentUser {
        notifications(read: $read, orderBy: createdAt_desc) {
          read
          reason
          post {
            content
          }
          comment {
            content
          }
        }
      }
    }
  `

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    describe('given another user', () => {
      let postTitle
      let postContent
      let postAuthor
      const createPostAction = async () => {
        const createPostMutation = gql`
          mutation($id: ID, $postTitle: String!, $postContent: String!) {
            CreatePost(id: $id, title: $postTitle, content: $postContent) {
              id
              title
              content
            }
          }
        `
        authenticatedUser = await postAuthor.toJson()
        await mutate({
          mutation: createPostMutation,
          variables: {
            id: 'p47',
            postTitle,
            postContent,
          },
        })
        authenticatedUser = await user.toJson()
      }

      let commentContent
      let commentAuthor
      const createCommentOnPostAction = async () => {
        await createPostAction()
        const createCommentMutation = gql`
          mutation($id: ID, $postId: ID!, $commentContent: String!) {
            CreateComment(id: $id, postId: $postId, content: $commentContent) {
              id
              content
            }
          }
        `
        authenticatedUser = await commentAuthor.toJson()
        await mutate({
          mutation: createCommentMutation,
          variables: {
            id: 'c47',
            postId: 'p47',
            commentContent,
          },
        })
        authenticatedUser = await user.toJson()
      }

      describe('comments on my post', () => {
        beforeEach(async () => {
          postTitle = 'My post'
          postContent = 'My post content.'
          postAuthor = user
        })

        describe('commenter is not me', () => {
          beforeEach(async () => {
            commentContent = 'Commenters comment.'
            commentAuthor = await instance.create('User', {
              id: 'commentAuthor',
              name: 'Mrs Comment',
              slug: 'mrs-comment',
              email: 'commentauthor@example.org',
              password: '1234',
            })
          })

          it('sends me a notification', async () => {
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [
                    {
                      read: false,
                      reason: 'comment_on_post',
                      post: null,
                      comment: {
                        content: commentContent,
                      },
                    },
                  ],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          it('sends me no notification if I block the comment author', async () => {
            await user.relateTo(commentAuthor, 'blocked')
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })

        describe('commenter is me', () => {
          beforeEach(async () => {
            commentContent = 'My comment.'
            commentAuthor = user
          })

          it('sends me no notification', async () => {
            await user.relateTo(commentAuthor, 'blocked')
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })
      })

      beforeEach(async () => {
        postAuthor = await instance.create('User', {
          id: 'postAuthor',
          name: 'Mrs Post',
          slug: 'mrs-post',
          email: 'post-author@example.org',
          password: '1234',
        })
      })

      describe('mentions me in a post', () => {
        beforeEach(async () => {
          postTitle = 'Mentioning Al Capone'
          postContent =
            'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone">@al-capone</a> how do you do?'
        })

        it('sends me a notification', async () => {
          await createPostAction()
          const expectedContent =
            'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone" target="_blank">@al-capone</a> how do you do?'
          const expected = expect.objectContaining({
            data: {
              currentUser: {
                notifications: [
                  {
                    read: false,
                    reason: 'mentioned_in_post',
                    post: {
                      content: expectedContent,
                    },
                    comment: null,
                  },
                ],
              },
            },
          })
          const { query } = createTestClient(server)
          await expect(
            query({
              query: notificationQuery,
              variables: {
                read: false,
              },
            }),
          ).resolves.toEqual(expected)
        })

        describe('who mentions me many times', () => {
          const updatePostAction = async () => {
            const updatedContent = `
              One more mention to
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
              and again:
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
              and again
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
            `
            const updatePostMutation = gql`
              mutation($id: ID!, $postTitle: String!, $postContent: String!) {
                UpdatePost(id: $id, content: $postContent, title: $postTitle) {
                  title
                  content
                }
              }
            `
            authenticatedUser = await postAuthor.toJson()
            await mutate({
              mutation: updatePostMutation,
              variables: {
                id: 'p47',
                postTitle,
                postContent: updatedContent,
              },
            })
            authenticatedUser = await user.toJson()
          }

          it('creates exactly one more notification', async () => {
            await createPostAction()
            await updatePostAction()
            const expectedContent =
              '<br>One more mention to<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>and again:<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>and again<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>'
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [
                    {
                      read: false,
                      reason: 'mentioned_in_post',
                      post: {
                        content: expectedContent,
                      },
                      comment: null,
                    },
                    {
                      read: false,
                      reason: 'mentioned_in_post',
                      post: {
                        content: expectedContent,
                      },
                      comment: null,
                    },
                  ],
                },
              },
            })
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })

        describe('but the author of the post blocked me', () => {
          beforeEach(async () => {
            await postAuthor.relateTo(user, 'blocked')
          })

          it('sends no notification', async () => {
            await createPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })
      })

      describe('mentions me in a comment', () => {
        beforeEach(async () => {
          postTitle = 'Post where I get mentioned in a comment'
          postContent = 'Content of post where I get mentioned in a comment.'
        })

        describe('I am not blocked at all', () => {
          beforeEach(async () => {
            commentContent =
              'One mention about me with <a data-mention-id="you" class="mention" href="/profile/you" target="_blank">@al-capone</a>.'
            commentAuthor = await instance.create('User', {
              id: 'commentAuthor',
              name: 'Mrs Comment',
              slug: 'mrs-comment',
              email: 'comment-author@example.org',
              password: '1234',
            })
          })

          it('sends a notification', async () => {
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [
                    {
                      read: false,
                      reason: 'mentioned_in_comment',
                      post: null,
                      comment: {
                        content: commentContent,
                      },
                    },
                  ],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })

        describe('but the author of the post blocked me', () => {
          beforeEach(async () => {
            await postAuthor.relateTo(user, 'blocked')
            commentContent =
              'One mention about me with <a data-mention-id="you" class="mention" href="/profile/you" target="_blank">@al-capone</a>.'
            commentAuthor = await instance.create('User', {
              id: 'commentAuthor',
              name: 'Mrs Comment',
              slug: 'mrs-comment',
              email: 'comment-author@example.org',
              password: '1234',
            })
          })

          it('sends no notification', async () => {
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                currentUser: {
                  notifications: [],
                },
              },
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })
      })
    })
  })
})

describe('Hashtags', () => {
  const postId = 'p135'
  const postTitle = 'Two Hashtags'
  const postContent =
    '<p>Hey Dude, <a class="hashtag" href="/search/hashtag/Democracy">#Democracy</a> should work equal for everybody!? That seems to be the only way to have equal <a class="hashtag" href="/search/hashtag/Liberty">#Liberty</a> for everyone.</p>'
  const postWithHastagsQuery = gql`
    query($id: ID) {
      Post(id: $id) {
        tags {
          id
        }
      }
    }
  `
  const postWithHastagsVariables = {
    id: postId,
  }
  const createPostMutation = gql`
    mutation($postId: ID, $postTitle: String!, $postContent: String!) {
      CreatePost(id: $postId, title: $postTitle, content: $postContent) {
        id
        title
        content
      }
    }
  `

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    describe('create a Post with Hashtags', () => {
      beforeEach(async () => {
        await mutate({
          mutation: createPostMutation,
          variables: {
            postId,
            postTitle,
            postContent,
          },
        })
      })

      it('both Hashtags are created with the "id" set to their "name"', async () => {
        const expected = [
          {
            id: 'Democracy',
          },
          {
            id: 'Liberty',
          },
        ]
        await expect(
          query({
            query: postWithHastagsQuery,
            variables: postWithHastagsVariables,
          }),
        ).resolves.toEqual(
          expect.objectContaining({
            data: {
              Post: [
                {
                  tags: expect.arrayContaining(expected),
                },
              ],
            },
          }),
        )
      })

      describe('afterwards update the Post by removing a Hashtag, leaving a Hashtag and add a Hashtag', () => {
        // The already existing Hashtag has no class at this point.
        const updatedPostContent =
          '<p>Hey Dude, <a class="hashtag" href="/search/hashtag/Elections">#Elections</a> should work equal for everybody!? That seems to be the only way to have equal <a href="/search/hashtag/Liberty">#Liberty</a> for everyone.</p>'
        const updatePostMutation = gql`
          mutation($postId: ID!, $postTitle: String!, $updatedPostContent: String!) {
            UpdatePost(id: $postId, title: $postTitle, content: $updatedPostContent) {
              id
              title
              content
            }
          }
        `

        it('only one previous Hashtag and the new Hashtag exists', async () => {
          await mutate({
            mutation: updatePostMutation,
            variables: {
              postId,
              postTitle,
              updatedPostContent,
            },
          })

          const expected = [
            {
              id: 'Elections',
            },
            {
              id: 'Liberty',
            },
          ]
          await expect(
            query({
              query: postWithHastagsQuery,
              variables: postWithHastagsVariables,
            }),
          ).resolves.toEqual(
            expect.objectContaining({
              data: {
                Post: [
                  {
                    tags: expect.arrayContaining(expected),
                  },
                ],
              },
            }),
          )
        })
      })
    })
  })
})
