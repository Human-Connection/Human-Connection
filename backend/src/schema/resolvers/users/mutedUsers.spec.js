import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'
import { cleanDatabase } from '../../../db/factories'
import { gql } from '../../../helpers/jest'
import { getNeode, getDriver } from '../../../db/neo4j'

const driver = getDriver()
const neode = getNeode()

let currentUser
let mutedUser
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
  await cleanDatabase()
})

describe('mutedUsers', () => {
  let mutedUserQuery
  beforeEach(() => {
    mutedUserQuery = gql`
      query {
        mutedUsers {
          id
          name
          isMuted
        }
      }
    `
  })

  it('throws permission error', async () => {
    const { query } = createTestClient(server)
    const result = await query({ query: mutedUserQuery })
    expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
  })

  describe('authenticated and given a muted user', () => {
    beforeEach(async () => {
      currentUser = await neode.create('User', {
        name: 'Current User',
        id: 'u1',
      })
      mutedUser = await neode.create('User', {
        name: 'Muted User',
        id: 'u2',
      })
      await currentUser.relateTo(mutedUser, 'muted')
      authenticatedUser = await currentUser.toJson()
    })

    it('returns a list of muted users', async () => {
      const { query } = createTestClient(server)
      await expect(query({ query: mutedUserQuery })).resolves.toEqual(
        expect.objectContaining({
          data: {
            mutedUsers: [
              {
                name: 'Muted User',
                id: 'u2',
                isMuted: true,
              },
            ],
          },
        }),
      )
    })
  })
})

describe('muteUser', () => {
  let muteAction

  beforeEach(() => {
    currentUser = undefined
    muteAction = (variables) => {
      const { mutate } = createTestClient(server)
      const muteUserMutation = gql`
        mutation($id: ID!) {
          muteUser(id: $id) {
            id
            name
            isMuted
          }
        }
      `
      return mutate({ mutation: muteUserMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await muteAction({ id: 'u2' })
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

    describe('mute yourself', () => {
      it('returns null', async () => {
        await expect(muteAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { muteUser: null } }),
        )
      })
    })

    describe('mute not existing user', () => {
      it('returns null', async () => {
        await expect(muteAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({ data: { muteUser: null } }),
        )
      })
    })

    describe('given a to-be-muted user', () => {
      beforeEach(async () => {
        mutedUser = await neode.create('User', {
          name: 'Muted User',
          id: 'u2',
        })
      })

      it('mutes a user', async () => {
        await expect(muteAction({ id: 'u2' })).resolves.toEqual(
          expect.objectContaining({
            data: {
              muteUser: { id: 'u2', name: 'Muted User', isMuted: true },
            },
          }),
        )
      })

      it('unfollows the user', async () => {
        await currentUser.relateTo(mutedUser, 'following')
        const queryUser = gql`
          query {
            User(id: "u2") {
              id
              isMuted
              followedByCurrentUser
            }
          }
        `
        const { query } = createTestClient(server)
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isMuted: false, followedByCurrentUser: true }] },
          }),
        )
        await muteAction({ id: 'u2' })
        await expect(query({ query: queryUser })).resolves.toEqual(
          expect.objectContaining({
            data: { User: [{ id: 'u2', isMuted: true, followedByCurrentUser: false }] },
          }),
        )
      })

      describe('given both the current user and the to-be-muted user write a post', () => {
        let postQuery

        beforeEach(async () => {
          const post1 = await neode.create('Post', {
            id: 'p12',
            title: 'A post written by the current user',
          })
          const post2 = await neode.create('Post', {
            id: 'p23',
            title: 'A post written by the muted user',
          })
          await Promise.all([
            post1.relateTo(currentUser, 'author'),
            post2.relateTo(mutedUser, 'author'),
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
                    title: 'A post written by the muted user',
                    author: {
                      name: 'Muted User',
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

          describe('but if the current user mutes the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(mutedUser, 'muted')
            })

            it("the muted user's post won't show up in the newsfeed of the current user", async () => {
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

        describe('from the perspective of the muted user', () => {
          beforeEach(async () => {
            authenticatedUser = await mutedUser.toJson()
          })

          it('both posts are in the newsfeed', bothPostsAreInTheNewsfeed)
          describe('but if the current user mutes the other user', () => {
            beforeEach(async () => {
              await currentUser.relateTo(mutedUser, 'muted')
            })

            it("the current user's post will show up in the newsfeed of the muted user", async () => {
              const { query } = createTestClient(server)
              await expect(query({ query: postQuery })).resolves.toEqual(
                expect.objectContaining({
                  data: {
                    Post: expect.arrayContaining([
                      {
                        id: 'p23',
                        title: 'A post written by the muted user',
                        author: { name: 'Muted User', id: 'u2' },
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

describe('unmuteUser', () => {
  let unmuteAction

  beforeEach(() => {
    currentUser = undefined
    unmuteAction = (variables) => {
      const { mutate } = createTestClient(server)
      const unmuteUserMutation = gql`
        mutation($id: ID!) {
          unmuteUser(id: $id) {
            id
            name
            isMuted
          }
        }
      `
      return mutate({ mutation: unmuteUserMutation, variables })
    }
  })

  it('throws permission error', async () => {
    const result = await unmuteAction({ id: 'u2' })
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

    describe('unmute yourself', () => {
      it('returns null', async () => {
        await expect(unmuteAction({ id: 'u1' })).resolves.toEqual(
          expect.objectContaining({ data: { unmuteUser: null } }),
        )
      })
    })

    describe('unmute not-existing user', () => {
      it('returns null', async () => {
        await expect(unmuteAction({ id: 'lksjdflksfdj' })).resolves.toEqual(
          expect.objectContaining({ data: { unmuteUser: null } }),
        )
      })
    })

    describe('given another user', () => {
      beforeEach(async () => {
        mutedUser = await neode.create('User', {
          name: 'Muted User',
          id: 'u2',
        })
      })

      describe('unmuting a not yet muted user', () => {
        it('does not hurt', async () => {
          await expect(unmuteAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: {
                unmuteUser: { id: 'u2', name: 'Muted User', isMuted: false },
              },
            }),
          )
        })
      })

      describe('given a muted user', () => {
        beforeEach(async () => {
          await currentUser.relateTo(mutedUser, 'muted')
        })

        it('unmutes a user', async () => {
          await expect(unmuteAction({ id: 'u2' })).resolves.toEqual(
            expect.objectContaining({
              data: {
                unmuteUser: { id: 'u2', name: 'Muted User', isMuted: false },
              },
            }),
          )
        })

        describe('unmuting twice', () => {
          it('has no effect', async () => {
            await unmuteAction({ id: 'u2' })
            await expect(unmuteAction({ id: 'u2' })).resolves.toEqual(
              expect.objectContaining({
                data: {
                  unmuteUser: {
                    id: 'u2',
                    name: 'Muted User',
                    isMuted: false,
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
