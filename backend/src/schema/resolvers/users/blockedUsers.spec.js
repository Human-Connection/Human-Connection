import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'
import Factory from '../../../seed/factories'
import { gql } from '../../../helpers/jest'
import { getNeode, getDriver } from '../../../bootstrap/neo4j'

const driver = getDriver()
const factory = Factory()
const neode = getNeode()

let currentUser
let blockedUser
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

describe('blockedUsers', () => {
  let blockedUserQuery
  beforeEach(() => {
    blockedUserQuery = gql`
      query {
        blockedUsers {
          id
          name
          isBlocked
        }
      }
    `
  })

  it('throws permission error', async () => {
    const { query } = createTestClient(server)
    const result = await query({ query: blockedUserQuery })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated and given a blocked user', () => {
    beforeEach(async () => {
      currentUser = await neode.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      blockedUser = await neode.create('User', {
        name: 'Blocked User',
        id: 'u2',
      })
      await currentUser.relateTo(blockedUser, 'blocked')
      authenticatedUser = await currentUser.toJson()
    })

    it('returns a list of blocked users', async () => {
      const { query } = createTestClient(server)
      await expect(query({ query: blockedUserQuery })).resolves.toEqual(
        expect.objectContaining({
          data: {
            blockedUsers: [
              {
                name: 'Blocked User',
                id: 'u2',
                isBlocked: true,
              },
            ],
          },
        }),
      )
    })
  })
})

describe('block', () => {
  let blockAction

  beforeEach(() => {
    currentUser = undefined
    blockAction = variables => {
      const { mutate } = createTestClient(server)
      const blockMutation = gql`
        mutation($id: ID!) {
          block(id: $id) {
            id
            name
            isBlocked
          }
        }
      `
      return mutate({ mutation: blockMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await blockAction({ id: 'u2' })
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

    describe('block yourself', () => {
      it('returns null', async () => {
        await expect(blockAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { block: null } }),
        )
      })
    })

    describe('block not existing user', () => {
      it('returns null', async () => {
        await expect(blockAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({ data: { block: null } }),
        )
      })
    })

    describe('given a to-be-blocked user', () => {
      beforeEach(async () => {
        blockedUser = await neode.create('User', {
          name: 'Blocked User',
          id: 'u2',
        })
      })

      it('blocks a user', async () => {
        await expect(blockAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({
            data: { block: { id: 'u2', name: 'Blocked User', isBlocked: true } },
          }),
        )
      })

      it('unfollows the user', async () => {
        await currentUser.relateTo(blockedUser, 'following')
        const queryUser = gql`
          query {
            User(id: "u2") {
              id
              isBlocked
              followedByCurrentUser
            }
          }
        `
        const { query } = createTestClient(server)
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlocked: false, followedByCurrentUser: true }] },
          }),
        )
        await blockAction({ id: 'u2' })
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isBlocked: true, followedByCurrentUser: false }] },
          }),
        )
      })

      describe('given both the current user and the to-be-blocked user write a post', () => {
        let postQuery

        beforeEach(async () => {
          const post1 = await neode.create('Post', {
            id: 'p12',
            title: 'A post written by the current user',
          })
          const post2 = await neode.create('Post', {
            id: 'p23',
            title: 'A post written by the blocked user',
          })
          await Promise.all([
            post1.relateTo(currentUser, 'author'),
            post2.relateTo(blockedUser, 'author'),
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
                    title: 'A post written by the blocked user',
                    author: {
                      name: 'Blocked User',
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

          describe('but if the current user blocks the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(blockedUser, 'blocked')
            })

            it("the blocked user's post won't show up in the newsfeed of the current user", async () => {
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

        describe('from the perspective of the blocked user', () => {
          beforeEach(async () => {
            authenticatedUser = await blockedUser.toJson()
          })

          it('both posts are in the newsfeed', bothPostsAreInTheNewsfeed)
          describe('but if the current user blocks the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(blockedUser, 'blocked')
            })

            it("the current user's post won't show up in the newsfeed of the blocked user", async () => {
              const { query } = createTestClient(server)
              await expect(query({ query: postQuery })).resolves.toEqual(
                expect.objectContaining({
                  data: {
                    Post: [
                      {
                        id: 'p23',
                        title: 'A post written by the blocked user',
                        author: { name: 'Blocked User', id: 'u2' },
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
  })
})

describe('unblock', () => {
  let unblockAction

  beforeEach(() => {
    currentUser = undefined
    unblockAction = variables => {
      const { mutate } = createTestClient(server)
      const unblockMutation = gql`
        mutation($id: ID!) {
          unblock(id: $id) {
            id
            name
            isBlocked
          }
        }
      `
      return mutate({ mutation: unblockMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await unblockAction({ id: 'u2' })
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

    describe('unblock yourself', () => {
      it('returns null', async () => {
        await expect(unblockAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { unblock: null } }),
        )
      })
    })

    describe('unblock not-existing user', () => {
      it('returns null', async () => {
        await expect(unblockAction({ id: 'lksjdflksfdj' })).resolves.toEqual(
          expect.objectContaining({ data: { unblock: null } }),
        )
      })
    })

    describe('given another user', () => {
      beforeEach(async () => {
        blockedUser = await neode.create('User', {
          name: 'Blocked User',
          id: 'u2',
        })
      })

      describe('unblocking a not yet blocked user', () => {
        it('does not hurt', async () => {
          await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
            }),
          )
        })
      })

      describe('given a blocked user', () => {
        beforeEach(async () => {
          await currentUser.relateTo(blockedUser, 'blocked')
        })

        it('unblocks a user', async () => {
          await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
            }),
          )
        })

        describe('unblocking twice', () => {
          it('has no effect', async () => {
            await unblockAction({ id: 'u2' })
            await expect(unblockAction({ id: 'u2' })).resolves.toEqual(
              expect.objectContaining({
                data: { unblock: { id: 'u2', name: 'Blocked User', isBlocked: false } },
              }),
            )
          })
        })
      })
    })
  })
})
