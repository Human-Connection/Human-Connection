import { GraphQLClient } from 'graphql-request'
import { host, login, gql } from '../../jest/helpers'
import Factory from '../../seed/factories'

const factory = Factory()
let client

beforeEach(async () => {
  await factory.create('User', {
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

describe('currentUser { notifications }', () => {
  const query = gql`
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
    let headers
    beforeEach(async () => {
      headers = await login({
        email: 'test@example.org',
        password: '1234',
      })
      client = new GraphQLClient(host, {
        headers,
      })
    })

    describe('given another user', () => {
      let authorClient
      let authorParams
      let authorHeaders

      beforeEach(async () => {
        authorParams = {
          email: 'author@example.org',
          password: '1234',
          id: 'author',
        }
        await factory.create('User', authorParams)
        authorHeaders = await login(authorParams)
      })

      describe('who mentions me in a post', () => {
        let post
        const title = 'Mentioning Al Capone'
        const content =
          'Hey <a class="mention" href="/profile/you/al-capone">@al-capone</a> how do you do?'

        beforeEach(async () => {
          const createPostMutation = gql`
            mutation($title: String!, $content: String!) {
              CreatePost(title: $title, content: $content) {
                id
                title
                content
              }
            }
          `
          authorClient = new GraphQLClient(host, {
            headers: authorHeaders,
          })
          const { CreatePost } = await authorClient.request(createPostMutation, {
            title,
            content,
          })
          post = CreatePost
        })

        it('sends you a notification', async () => {
          const expectedContent =
            'Hey <a href="/profile/you/al-capone" target="_blank">@al-capone</a> how do you do?'
          const expected = {
            currentUser: {
              notifications: [
                {
                  read: false,
                  post: {
                    content: expectedContent,
                  },
                },
              ],
            },
          }
          await expect(
            client.request(query, {
              read: false,
            }),
          ).resolves.toEqual(expected)
        })

        describe('who mentions me again', () => {
          beforeEach(async () => {
            const updatedContent = `${post.content} One more mention to <a href="/profile/you" class="mention">@al-capone</a>`
            // The response `post.content` contains a link but the XSSmiddleware
            // should have the `mention` CSS class removed. I discovered this
            // during development and thought: A feature not a bug! This way we
            // can encode a re-mentioning of users when you edit your post or
            // comment.
            const updatePostMutation = gql`
              mutation($id: ID!, $title: String!, $content: String!) {
                UpdatePost(id: $id, content: $content, title: $title) {
                  title
                  content
                }
              }
            `
            authorClient = new GraphQLClient(host, {
              headers: authorHeaders,
            })
            await authorClient.request(updatePostMutation, {
              id: post.id,
              title: post.title,
              content: updatedContent,
            })
          })

          it('creates exactly one more notification', async () => {
            const expectedContent =
              'Hey <a href="/profile/you/al-capone" target="_blank">@al-capone</a> how do you do? One more mention to <a href="/profile/you" target="_blank">@al-capone</a>'
            const expected = {
              currentUser: {
                notifications: [
                  {
                    read: false,
                    post: {
                      content: expectedContent,
                    },
                  },
                  {
                    read: false,
                    post: {
                      content: expectedContent,
                    },
                  },
                ],
              },
            }
            await expect(
              client.request(query, {
                read: false,
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
          name
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
    let headers
    beforeEach(async () => {
      headers = await login({
        email: 'test@example.org',
        password: '1234',
      })
      client = new GraphQLClient(host, {
        headers,
      })
    })

    describe('create a Post with Hashtags', () => {
      beforeEach(async () => {
        await client.request(createPostMutation, {
          postId,
          postTitle,
          postContent,
        })
      })

      it('both Hashtags are created with the "id" set to thier "name"', async () => {
        const expected = [
          {
            id: 'Democracy',
            name: 'Democracy',
          },
          {
            id: 'Liberty',
            name: 'Liberty',
          },
        ]
        await expect(
          client.request(postWithHastagsQuery, postWithHastagsVariables),
        ).resolves.toEqual({
          Post: [
            {
              tags: expect.arrayContaining(expected),
            },
          ],
        })
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
          await client.request(updatePostMutation, {
            postId,
            postTitle,
            updatedPostContent,
          })

          const expected = [
            {
              id: 'Elections',
              name: 'Elections',
            },
            {
              id: 'Liberty',
              name: 'Liberty',
            },
          ]
          await expect(
            client.request(postWithHastagsQuery, postWithHastagsVariables),
          ).resolves.toEqual({
            Post: [
              {
                tags: expect.arrayContaining(expected),
              },
            ],
          })
        })
      })
    })
  })
})
