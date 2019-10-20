import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()

let query
let mutate
let graphqlQuery
const categoryIds = ['cat9']
let authenticatedUser
let user
let moderator
let troll

const action = () => {
  return query({ query: graphqlQuery })
}

beforeAll(async () => {
  // For performance reasons we do this only once
  const users = await Promise.all([
    factory.create('User', { id: 'u1', role: 'user' }),
    factory.create('User', {
      id: 'm1',
      role: 'moderator',
      password: '1234',
    }),
    factory.create('User', {
      id: 'u2',
      role: 'user',
      name: 'Offensive Name',
      slug: 'offensive-name',
      avatar: '/some/offensive/avatar.jpg',
      about: 'This self description is very offensive',
    }),
  ])

  user = users[0]
  moderator = users[1]
  troll = users[2]

  await neode.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })

  await Promise.all([
    user.relateTo(troll, 'following'),
    factory.create('Post', {
      author: user,
      id: 'p1',
      title: 'Deleted post',
      slug: 'deleted-post',
      deleted: true,
      categoryIds,
    }),
    factory.create('Post', {
      author: user,
      id: 'p3',
      title: 'Publicly visible post',
      slug: 'publicly-visible-post',
      deleted: false,
      categoryIds,
    }),
  ])

  await Promise.all([
    factory.create('Comment', {
      author: user,
      id: 'c2',
      postId: 'p3',
      content: 'Enabled comment on public post',
    }),
  ])

  await factory.create('Post', {
    id: 'p2',
    author: troll,
    title: 'Disabled post',
    content: 'This is an offensive post content',
    contentExcerpt: 'This is an offensive post content',
    image: '/some/offensive/image.jpg',
    deleted: false,
    categoryIds,
  })
  await factory.create('Comment', {
    id: 'c1',
    author: troll,
    postId: 'p3',
    content: 'Disabled comment',
    contentExcerpt: 'Disabled comment',
  })

  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  const client = createTestClient(server)
  query = client.query
  mutate = client.mutate

  authenticatedUser = await moderator.toJson()
  const disableMutation = gql`
    mutation($id: ID!) {
      disable(id: $id)
    }
  `
  await Promise.all([
    mutate({ mutation: disableMutation, variables: { id: 'c1' } }),
    mutate({ mutation: disableMutation, variables: { id: 'u2' } }),
    mutate({ mutation: disableMutation, variables: { id: 'p2' } }),
  ])
  authenticatedUser = null
})

afterAll(async () => {
  await factory.cleanDatabase()
})

describe('softDeleteMiddleware', () => {
  describe('read disabled content', () => {
    let subject
    const beforeComment = async () => {
      graphqlQuery = gql`
        {
          User(id: "u1") {
            following {
              comments {
                content
                contentExcerpt
              }
            }
          }
        }
      `
      const { data } = await action()
      subject = data.User[0].following[0].comments[0]
    }
    const beforeUser = async () => {
      graphqlQuery = gql`
        {
          User(id: "u1") {
            following {
              name
              slug
              about
              avatar
            }
          }
        }
      `
      const { data } = await action()
      subject = data.User[0].following[0]
    }
    const beforePost = async () => {
      graphqlQuery = gql`
        {
          User(id: "u1") {
            following {
              contributions {
                title
                slug
                image
                content
                contentExcerpt
              }
            }
          }
        }
      `
      const { data } = await action()
      subject = data.User[0].following[0].contributions[0]
    }

    describe('as moderator', () => {
      beforeEach(async () => {
        authenticatedUser = await moderator.toJson()
      })

      describe('User', () => {
        beforeEach(beforeUser)

        it('displays name', () => expect(subject.name).toEqual('Offensive Name'))
        it('displays slug', () => expect(subject.slug).toEqual('offensive-name'))
        it('displays about', () =>
          expect(subject.about).toEqual('This self description is very offensive'))
        it('displays avatar', () => expect(subject.avatar).toEqual('/some/offensive/avatar.jpg'))
      })

      describe('Post', () => {
        beforeEach(beforePost)

        it('displays title', () => expect(subject.title).toEqual('Disabled post'))
        it('displays slug', () => expect(subject.slug).toEqual('disabled-post'))
        it('displays content', () =>
          expect(subject.content).toEqual('This is an offensive post content'))
        it('displays contentExcerpt', () =>
          expect(subject.contentExcerpt).toEqual('This is an offensive post content'))
        it('displays image', () => expect(subject.image).toEqual('/some/offensive/image.jpg'))
      })

      describe('Comment', () => {
        beforeEach(beforeComment)

        it('displays content', () => expect(subject.content).toEqual('Disabled comment'))
        it('displays contentExcerpt', () =>
          expect(subject.contentExcerpt).toEqual('Disabled comment'))
      })
    })

    describe('as user', () => {
      beforeEach(async () => {
        authenticatedUser = await user.toJson()
      })

      describe('User', () => {
        beforeEach(beforeUser)

        it('obfuscates name', () => expect(subject.name).toEqual('UNAVAILABLE'))
        it('obfuscates slug', () => expect(subject.slug).toEqual('UNAVAILABLE'))
        it('obfuscates about', () => expect(subject.about).toEqual('UNAVAILABLE'))
        it('obfuscates avatar', () => expect(subject.avatar).toEqual('UNAVAILABLE'))
      })

      describe('Post', () => {
        beforeEach(beforePost)

        it('obfuscates title', () => expect(subject.title).toEqual('UNAVAILABLE'))
        it('obfuscates slug', () => expect(subject.slug).toEqual('UNAVAILABLE'))
        it('obfuscates content', () => expect(subject.content).toEqual('UNAVAILABLE'))
        it('obfuscates contentExcerpt', () => expect(subject.contentExcerpt).toEqual('UNAVAILABLE'))
        it('obfuscates image', () => expect(subject.image).toEqual(null))
      })

      describe('Comment', () => {
        beforeEach(beforeComment)

        it('obfuscates content', () => expect(subject.content).toEqual('UNAVAILABLE'))
        it('obfuscates contentExcerpt', () => expect(subject.contentExcerpt).toEqual('UNAVAILABLE'))
      })
    })
  })

  describe('Query', () => {
    describe('Post', () => {
      beforeEach(async () => {
        graphqlQuery = gql`
          {
            Post {
              title
            }
          }
        `
      })

      describe('as user', () => {
        beforeEach(async () => {
          authenticatedUser = await user.toJson()
        })

        it('hides deleted or disabled posts', async () => {
          const expected = { data: { Post: [{ title: 'Publicly visible post' }] } }
          await expect(action()).resolves.toMatchObject(expected)
        })
      })

      describe('as moderator', () => {
        beforeEach(async () => {
          authenticatedUser = await moderator.toJson()
        })

        it('shows disabled but hides deleted posts', async () => {
          const expected = [{ title: 'Disabled post' }, { title: 'Publicly visible post' }]
          const {
            data: { Post },
          } = await action()
          await expect(Post).toEqual(expect.arrayContaining(expected))
        })
      })

      describe('.comments', () => {
        beforeEach(async () => {
          graphqlQuery = gql`
            {
              Post(id: "p3") {
                title
                comments {
                  content
                }
              }
            }
          `
        })

        describe('as user', () => {
          beforeEach(async () => {
            authenticatedUser = await user.toJson()
          })

          it('conceals disabled comments', async () => {
            const expected = [
              { content: 'Enabled comment on public post' },
              { content: 'UNAVAILABLE' },
            ]
            const {
              data: {
                Post: [{ comments }],
              },
            } = await action()
            await expect(comments).toEqual(expect.arrayContaining(expected))
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            authenticatedUser = await moderator.toJson()
          })

          it('shows disabled comments', async () => {
            const expected = [
              { content: 'Enabled comment on public post' },
              { content: 'Disabled comment' },
            ]
            const {
              data: {
                Post: [{ comments }],
              },
            } = await action()
            await expect(comments).toEqual(expect.arrayContaining(expected))
          })
        })
      })

      describe('filter (deleted: true)', () => {
        beforeEach(() => {
          graphqlQuery = gql`
            {
              Post(deleted: true) {
                title
              }
            }
          `
        })

        describe('as user', () => {
          beforeEach(async () => {
            authenticatedUser = await user.toJson()
          })

          it('throws authorisation error', async () => {
            const { data, errors } = await action()
            expect(data).toEqual({ Post: null })
            expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            authenticatedUser = await moderator.toJson()
          })

          it('does not show deleted posts', async () => {
            const expected = { data: { Post: [{ title: 'UNAVAILABLE' }] } }
            await expect(action()).resolves.toMatchObject(expected)
          })
        })
      })

      describe('filter (disabled: true)', () => {
        beforeEach(() => {
          graphqlQuery = gql`
            {
              Post(disabled: true) {
                title
              }
            }
          `
        })

        describe('as user', () => {
          beforeEach(async () => {
            authenticatedUser = await user.toJson()
          })

          it('throws authorisation error', async () => {
            const { data, errors } = await action()
            expect(data).toEqual({ Post: null })
            expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
          })
        })

        describe('as moderator', () => {
          beforeEach(async () => {
            authenticatedUser = await moderator.toJson()
          })

          it('shows disabled posts', async () => {
            const expected = { data: { Post: [{ title: 'Disabled post' }] } }
            await expect(action()).resolves.toMatchObject(expected)
          })
        })
      })
    })
  })
})
