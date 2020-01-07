import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'
import Factory from '../../../seed/factories'
import { gql } from '../../../helpers/jest'
import { getNeode, getDriver } from '../../../bootstrap/neo4j'

const driver = getDriver()
const factory = Factory()
const neode = getNeode()

let currentUser
let blacklistedUser
let authenticatedUser
let server

beforeEach(() => {
  authenticatedUser = undefined
  ;({ server } = createServer({
    context: () => {
      return {
        user: authenticatedUser,
        driver,
        neode,
        cypherParams: {
          currentUserId: authenticatedUser ? authenticatedUser.id : null,
        },
      }
    },
  }))
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('blacklistedUsers', () => {
  let blacklistedUserQuery
  beforeEach(() => {
    blacklistedUserQuery = gql`
      query {
        blacklistedUsers {
          id
          name
          isBlacklisted
        }
      }
    `
  })

  it('throws permission error', async () => {
    const { query } = createTestClient(server)
    const result = await query({ query: blacklistedUserQuery })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated and given a blacklisted user', () => {
    beforeEach(async () => {
      currentUser = await neode.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      blacklistedUser = await neode.create('User', {
        name: 'Blacklisted User',
        id: 'u2',
      })
      await currentUser.relateTo(blacklistedUser, 'blacklisted')
      authenticatedUser = await currentUser.toJson()
    })

    it('returns a list of blacklisted users', async () => {
      const { query } = createTestClient(server)
      await expect(query({ query: blacklistedUserQuery })).resolves.toEqual(
        expect.objectContaining({
          data: {
            blacklistedUsers: [
              {
                name: 'Blacklisted User',
                id: 'u2',
                isBlacklisted: true,
              },
            ],
          },
        }),
      )
    })
  })
})

describe('blacklistUserContent', () => {
  let blacklistAction

  beforeEach(() => {
    currentUser = undefined
    blacklistAction = variables => {
      const { mutate } = createTestClient(server)
      const blacklistUserContentMutation = gql`
        mutation($id: ID!) {
          blacklistUserContent(id: $id) {
            id
            name
            isBlacklisted
          }
        }
      `
      return mutate({ mutation: blacklistUserContentMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await blacklistAction({ id: 'u2' })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      currentUser = await neode.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      authenticatedUser = await currentUser.toJson()
    })

    describe('blacklist yourself', () => {
      it('returns null', async () => {
        await expect(blacklistAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { blacklistUserContent: null } }),
        )
      })
    })

    describe('blacklist not existing user', () => {
      it('returns null', async () => {
        await expect(blacklistAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({ data: { blacklistUserContent: null } }),
        )
      })
    })

    describe('given a to-be-blacklisted user', () => {
      beforeEach(async () => {
        blacklistedUser = await neode.create('User', {
          name: 'Blacklisted User',
          id: 'u2',
        })
      })

      it('blacklists a user', async () => {
        await expect(blacklistAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({
            data: {
              blacklistUserContent: { id: 'u2', name: 'Blacklisted User', isBlacklisted: true },
            },
          }),
        )
      })

      it('unfollows the user', async () => {
        await currentUser.relateTo(blacklistedUser, 'following')
        const queryUser = gql`
          query {
            User(id: "u2") {
              id
              isBlacklisted
              followedByCurrentUser
            }
          }
        `
        const { query } = createTestClient(server)
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlacklisted: false, followedByCurrentUser: true }] },
          }),
        )
        await blacklistAction({ id: 'u2' })
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlacklisted: true, followedByCurrentUser: false }] },
          }),
        )
      })

      describe('given both the current user and the to-be-blacklisted user write a post', () => {
        let postQuery

        beforeEach(async () => {
          const post1 = await neode.create('Post', {
            id: 'p12',
            title: 'A post written by the current user',
          })
          const post2 = await neode.create('Post', {
            id: 'p23',
            title: 'A post written by the blacklisted user',
          })
          await Promise.all([
            post1.relateTo(currentUser, 'author'),
            post2.relateTo(blacklistedUser, 'author'),
          ])
          postQuery = gql`
            query {
              Post(orderBy: createdAt_asc) {
                id
                title
                author {
                  id
                  name
                }
              }
            }
          `
        })

        const bothPostsAreInTheNewsfeed = async () => {
          const { query } = createTestClient(server)
          await expect(query({ query: postQuery })).resolves.toEqual(
            expect.objectContaining({
              data: {
                Post: [
                  {
                    id: 'p12',
                    title: 'A post written by the current user',
                    author: {
                      name: 'Current User',
                      id: 'u1',
                    },
                  },
                  {
                    id: 'p23',
                    title: 'A post written by the blacklisted user',
                    author: {
                      name: 'Blacklisted User',
                      id: 'u2',
                    },
                  },
                ],
              },
            }),
          )
        }

        describe('from the perspective of the current user', () => {
          it('both posts are in the newsfeed', bothPostsAreInTheNewsfeed)

          describe('but if the current user blacklists the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(blacklistedUser, 'blacklisted')
            })

            it("the blacklisted user's post won't show up in the newsfeed of the current user", async () => {
              const { query } = createTestClient(server)
              await expect(query({ query: postQuery })).resolves.toEqual(
                expect.objectContaining({
                  data: {
                    Post: [
                      {
                        id: 'p12',
                        title: 'A post written by the current user',
                        author: { name: 'Current User', id: 'u1' },
                      },
                    ],
                  },
                }),
              )
            })
          })
        })

        describe('from the perspective of the blacklisted user', () => {
          beforeEach(async () => {
            authenticatedUser = await blacklistedUser.toJson()
          })

          it('both posts are in the newsfeed', bothPostsAreInTheNewsfeed)
          describe('but if the current user blacklists the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(blacklistedUser, 'blacklisted')
            })

            it("the current user's post will show up in the newsfeed of the blacklisted user", async () => {
              const { query } = createTestClient(server)
              await expect(query({ query: postQuery })).resolves.toEqual(
                expect.objectContaining({
                  data: {
                    Post: expect.arrayContaining([
                      {
                        id: 'p23',
                        title: 'A post written by the blacklisted user',
                        author: { name: 'Blacklisted User', id: 'u2' },
                      },
                      {
                        id: 'p12',
                        title: 'A post written by the current user',
                        author: { name: 'Current User', id: 'u1' },
                      },
                    ]),
                  },
                }),
              )
            })
          })
        })
      })
    })
  })
})

describe('whitelistUserContent', () => {
  let whitelistAction

  beforeEach(() => {
    currentUser = undefined
    whitelistAction = variables => {
      const { mutate } = createTestClient(server)
      const whitelistUserContentMutation = gql`
        mutation($id: ID!) {
          whitelistUserContent(id: $id) {
            id
            name
            isBlacklisted
          }
        }
      `
      return mutate({ mutation: whitelistUserContentMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await whitelistAction({ id: 'u2' })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      currentUser = await neode.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      authenticatedUser = await currentUser.toJson()
    })

    describe('whitelist yourself', () => {
      it('returns null', async () => {
        await expect(whitelistAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { whitelistUserContent: null } }),
        )
      })
    })

    describe('whitelist not-existing user', () => {
      it('returns null', async () => {
        await expect(whitelistAction({ id: 'lksjdflksfdj' })).resolves.toEqual(
          expect.objectContaining({ data: { whitelistUserContent: null } }),
        )
      })
    })

    describe('given another user', () => {
      beforeEach(async () => {
        blacklistedUser = await neode.create('User', {
          name: 'Blacklisted User',
          id: 'u2',
        })
      })

      describe('whitelisting a not yet blacklisted user', () => {
        it('does not hurt', async () => {
          await expect(whitelistAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: {
                whitelistUserContent: { id: 'u2', name: 'Blacklisted User', isBlacklisted: false },
              },
            }),
          )
        })
      })

      describe('given a blacklisted user', () => {
        beforeEach(async () => {
          await currentUser.relateTo(blacklistedUser, 'blacklisted')
        })

        it('whitelists a user', async () => {
          await expect(whitelistAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: {
                whitelistUserContent: { id: 'u2', name: 'Blacklisted User', isBlacklisted: false },
              },
            }),
          )
        })

        describe('whitelisting twice', () => {
          it('has no effect', async () => {
            await whitelistAction({ id: 'u2' })
            await expect(whitelistAction({ id: 'u2' })).resolves.toEqual(
              expect.objectContaining({
                data: {
                  whitelistUserContent: {
                    id: 'u2',
                    name: 'Blacklisted User',
                    isBlacklisted: false,
                  },
                },
              }),
            )
          })
        })
      })
    })
  })
})
