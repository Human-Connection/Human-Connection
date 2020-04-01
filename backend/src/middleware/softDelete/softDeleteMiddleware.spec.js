import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const neode = getNeode()
const driver = getDriver()

const categoryIds = ['cat9']
let query, graphqlQuery, authenticatedUser, user, moderator, troll

const action = () => {
  return query({ query: graphqlQuery })
}

beforeAll(async () => {
  // For performance reasons we do this only once
  const users = await Promise.all([
    Factory.build('user', { id: 'u1', role: 'user' }),
    Factory.build(
      'user',
      {
        id: 'm1',
        role: 'moderator',
      },
      {
        password: '1234',
      },
    ),
    Factory.build(
      'user',
      {
        id: 'u2',
        role: 'user',
        name: 'Offensive Name',
        slug: 'offensive-name',
        about: 'This self description is very offensive',
      },
      {
        avatar: Factory.build('image', {
          url: '/some/offensive/avatar.jpg',
        }),
      },
    ),
    neode.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    }),
  ])

  user = users[0]
  moderator = users[1]
  troll = users[2]

  await Promise.all([
    user.relateTo(troll, 'following'),
    Factory.build(
      'post',
      {
        id: 'p1',
        title: 'Deleted post',
        slug: 'deleted-post',
        deleted: true,
      },
      {
        author: user,
        categoryIds,
      },
    ),
    Factory.build(
      'post',
      {
        id: 'p3',
        title: 'Publicly visible post',
        slug: 'publicly-visible-post',
        deleted: false,
      },
      {
        author: user,
        categoryIds,
      },
    ),
  ])

  const resources = await Promise.all([
    Factory.build(
      'comment',
      {
        id: 'c2',
        content: 'Enabled comment on public post',
      },
      {
        author: user,
        postId: 'p3',
      },
    ),
    Factory.build(
      'post',
      {
        id: 'p2',
        title: 'Disabled post',
        content: 'This is an offensive post content',
        contentExcerpt: 'This is an offensive post content',
        deleted: false,
      },
      {
        image: Factory.build('image', {
          url: '/some/offensive/image.jpg',
        }),
        author: troll,
        categoryIds,
      },
    ),
    Factory.build(
      'comment',
      {
        id: 'c1',
        content: 'Disabled comment',
        contentExcerpt: 'Disabled comment',
      },
      {
        author: troll,
        postId: 'p3',
      },
    ),
  ])

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

  const trollingPost = resources[1]
  const trollingComment = resources[2]

  const reports = await Promise.all([
    Factory.build('report'),
    Factory.build('report'),
    Factory.build('report'),
  ])
  const reportAgainstTroll = reports[0]
  const reportAgainstTrollingPost = reports[1]
  const reportAgainstTrollingComment = reports[2]

  const reportVariables = {
    resourceId: 'undefined-resource',
    reasonCategory: 'discrimination_etc',
    reasonDescription: 'I am what I am !!!',
  }

  await Promise.all([
    reportAgainstTroll.relateTo(user, 'filed', { ...reportVariables, resourceId: 'u2' }),
    reportAgainstTroll.relateTo(troll, 'belongsTo'),
    reportAgainstTrollingPost.relateTo(user, 'filed', { ...reportVariables, resourceId: 'p2' }),
    reportAgainstTrollingPost.relateTo(trollingPost, 'belongsTo'),
    reportAgainstTrollingComment.relateTo(moderator, 'filed', {
      ...reportVariables,
      resourceId: 'c1',
    }),
    reportAgainstTrollingComment.relateTo(trollingComment, 'belongsTo'),
  ])

  const disableVariables = {
    resourceId: 'undefined-resource',
    disable: true,
    closed: false,
  }

  await Promise.all([
    reportAgainstTroll.relateTo(moderator, 'reviewed', { ...disableVariables, resourceId: 'u2' }),
    troll.update({ disabled: true, updatedAt: new Date().toISOString() }),
    reportAgainstTrollingPost.relateTo(moderator, 'reviewed', {
      ...disableVariables,
      resourceId: 'p2',
    }),
    trollingPost.update({ disabled: true, updatedAt: new Date().toISOString() }),
    reportAgainstTrollingComment.relateTo(moderator, 'reviewed', {
      ...disableVariables,
      resourceId: 'c1',
    }),
    trollingComment.update({ disabled: true, updatedAt: new Date().toISOString() }),
  ])
})

afterAll(async () => {
  await cleanDatabase()
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
              avatar {
                url
              }
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
                image {
                  url
                }
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
        it('displays avatar', () =>
          expect(subject.avatar).toEqual({
            url: expect.stringContaining('/some/offensive/avatar.jpg'),
          }))
      })

      describe('Post', () => {
        beforeEach(beforePost)

        it('displays title', () => expect(subject.title).toEqual('Disabled post'))
        it('displays slug', () => expect(subject.slug).toEqual('disabled-post'))
        it('displays content', () =>
          expect(subject.content).toEqual('This is an offensive post content'))
        it('displays contentExcerpt', () =>
          expect(subject.contentExcerpt).toEqual('This is an offensive post content'))
        it('displays image', () =>
          expect(subject.image).toEqual({
            url: expect.stringContaining('/some/offensive/image.jpg'),
          }))
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
        it('obfuscates avatar', () => expect(subject.avatar).toEqual(null))
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
    })
  })
})
