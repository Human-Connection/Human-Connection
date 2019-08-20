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
          post {
            content
          }
        }
      }
    }
  `

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = user
    })

    describe('given another user', () => {
      let author
      beforeEach(async () => {
        author = await instance.create('User', {
          email: 'author@example.org',
          password: '1234',
          id: 'author',
        })
      })

      describe('who mentions me in a post', () => {
        const title = 'Mentioning Al Capone'
        const content =
          'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone">@al-capone</a> how do you do?'

        const createPostAction = async () => {
          const createPostMutation = gql`
            mutation($id: ID, $title: String!, $content: String!) {
              CreatePost(id: $id, title: $title, content: $content) {
                id
                title
                content
              }
            }
          `
          authenticatedUser = await author.toJson()
          await mutate({
            mutation: createPostMutation,
            variables: { id: 'p47', title, content },
          })
          authenticatedUser = await user.toJson()
        }

        it('sends you a notification', async () => {
          await createPostAction()
          const expectedContent =
            'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone" target="_blank">@al-capone</a> how do you do?'
          const expected = expect.objectContaining({
            data: {
              currentUser: { notifications: [{ read: false, post: { content: expectedContent } }] },
            },
          })
          const { query } = createTestClient(server)
          await expect(
            query({ query: notificationQuery, variables: { read: false } }),
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
              mutation($id: ID!, $title: String!, $content: String!) {
                UpdatePost(id: $id, content: $content, title: $title) {
                  title
                  content
                }
              }
            `
            authenticatedUser = await author.toJson()
            await mutate({
              mutation: updatePostMutation,
              variables: {
                id: 'p47',
                title,
                content: updatedContent,
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
                    { read: false, post: { content: expectedContent } },
                    { read: false, post: { content: expectedContent } },
                  ],
                },
              },
            })
            await expect(
              query({ query: notificationQuery, variables: { read: false } }),
            ).resolves.toEqual(expected)
          })
        })

        describe('but the author of the post blocked me', () => {
          beforeEach(async () => {
            await author.relateTo(user, 'blocked')
          })

          it('sends no notification', async () => {
            await createPostAction()
            const expected = expect.objectContaining({
              data: { currentUser: { notifications: [] } },
            })
            const { query } = createTestClient(server)
            await expect(
              query({ query: notificationQuery, variables: { read: false } }),
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
        const expected = [{ id: 'Democracy' }, { id: 'Liberty' }]
        await expect(
          query({ query: postWithHastagsQuery, variables: postWithHastagsVariables }),
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

          const expected = [{ id: 'Elections' }, { id: 'Liberty' }]
          await expect(
            query({ query: postWithHastagsQuery, variables: postWithHastagsVariables }),
          ).resolves.toEqual(
            expect.objectContaining({
              data: {
                Post: [{ tags: expect.arrayContaining(expected) }],
              },
            }),
          )
        })
      })
    })
  })
})
