import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()
const categoryIds = ['cat9']
let user

let query
let mutate
let authenticatedUser
let variables

const driver = getDriver()
const neode = getNeode()

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        driver,
        neode,
        user: authenticatedUser,
      }
    },
  })
  query = createTestClient(server).query
  mutate = createTestClient(server).mutate
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('User', () => {
  describe('query by email address', () => {
    beforeEach(async () => {
      await factory.create('User', { name: 'Johnny', email: 'any-email-address@example.org' })
    })

    const userQuery = gql`
      query($email: String) {
        User(email: $email) {
          name
        }
      }
    `
    const variables = { email: 'any-email-address@example.org' }

    it('is forbidden', async () => {
      await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
      })
    })

    describe('as admin', () => {
      beforeEach(async () => {
        const admin = await factory.create('User', {
          role: 'admin',
          email: 'admin@example.org',
          password: '1234',
        })
        authenticatedUser = await admin.toJson()
      })

      it('is permitted', async () => {
        await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
          data: { User: [{ name: 'Johnny' }] },
        })
      })
    })
  })
})

describe('UpdateUser', () => {
  let userParams
  let variables

  beforeEach(async () => {
    userParams = {
      email: 'user@example.org',
      password: '1234',
      id: 'u47',
      name: 'John Doe',
      termsAndConditionsAgreedVersion: null,
      termsAndConditionsAgreedAt: null,
    }

    variables = {
      id: 'u47',
      name: 'John Doughnut',
    }
  })

  const updateUserMutation = gql`
    mutation($id: ID!, $name: String, $termsAndConditionsAgreedVersion: String) {
      UpdateUser(
        id: $id
        name: $name
        termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
      ) {
        id
        name
        termsAndConditionsAgreedVersion
        termsAndConditionsAgreedAt
      }
    }
  `

  beforeEach(async () => {
    user = await factory.create('User', userParams)
  })

  describe('as another user', () => {
    beforeEach(async () => {
      const someoneElseParams = {
        email: 'someone-else@example.org',
        password: '1234',
        name: 'James Doe',
      }

      const someoneElse = await factory.create('User', someoneElseParams)
      authenticatedUser = await someoneElse.toJson()
    })

    it('is not allowed to change other user accounts', async () => {
      const { errors } = await mutate({ mutation: updateUserMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('as the same user', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    it('name within specifications', async () => {
      const expected = {
        data: {
          UpdateUser: {
            id: 'u47',
            name: 'John Doughnut',
          },
        },
      }
      await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject(
        expected,
      )
    })

    it('with `null` as name', async () => {
      const variables = {
        id: 'u47',
        name: null,
      }
      const { errors } = await mutate({ mutation: updateUserMutation, variables })
      expect(errors[0]).toHaveProperty(
        'message',
        'child "name" fails because ["name" contains an invalid value, "name" must be a string]',
      )
    })

    it('with too short name', async () => {
      const variables = {
        id: 'u47',
        name: '  ',
      }
      const { errors } = await mutate({ mutation: updateUserMutation, variables })
      expect(errors[0]).toHaveProperty(
        'message',
        'child "name" fails because ["name" length must be at least 3 characters long]',
      )
    })

    describe('given a new agreed version of terms and conditions', () => {
      beforeEach(async () => {
        variables = { ...variables, termsAndConditionsAgreedVersion: '0.0.2' }
      })
      it('update termsAndConditionsAgreedVersion', async () => {
        const expected = {
          data: {
            UpdateUser: expect.objectContaining({
              termsAndConditionsAgreedVersion: '0.0.2',
              termsAndConditionsAgreedAt: expect.any(String),
            }),
          },
        }

        await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })

    describe('given any attribute other than termsAndConditionsAgreedVersion', () => {
      beforeEach(async () => {
        variables = { ...variables, name: 'any name' }
      })
      it('update termsAndConditionsAgreedVersion', async () => {
        const expected = {
          data: {
            UpdateUser: expect.objectContaining({
              termsAndConditionsAgreedVersion: null,
              termsAndConditionsAgreedAt: null,
            }),
          },
        }

        await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject(
          expected,
        )
      })
    })

    it('rejects if version of terms and conditions has wrong format', async () => {
      variables = {
        ...variables,
        termsAndConditionsAgreedVersion: 'invalid version format',
      }
      const { errors } = await mutate({ mutation: updateUserMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Invalid version format!')
    })
  })
})

describe('DeleteUser', () => {
  const deleteUserMutation = gql`
    mutation($id: ID!, $resource: [Deletable]) {
      DeleteUser(id: $id, resource: $resource) {
        id
        name
        about
        deleted
        contributions {
          id
          content
          contentExcerpt
          deleted
          comments {
            id
            content
            contentExcerpt
            deleted
          }
        }
        comments {
          id
          content
          contentExcerpt
          deleted
        }
      }
    }
  `
  beforeEach(async () => {
    variables = { id: ' u343', resource: [] }

    user = await factory.create('User', {
      name: 'My name should be deleted',
      about: 'along with my about',
      id: 'u343',
    })
    await factory.create('User', {
      email: 'friends-account@example.org',
      password: '1234',
      id: 'not-my-account',
    })
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      const { errors } = await mutate({ mutation: deleteUserMutation, variables })
      expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await user.toJson()
    })

    describe("attempting to delete another user's account", () => {
      beforeEach(() => {
        variables = { ...variables, id: 'not-my-account' }
      })

      it('throws an authorization error', async () => {
        const { errors } = await mutate({ mutation: deleteUserMutation, variables })
        expect(errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('attempting to delete my own account', () => {
      beforeEach(() => {
        variables = { ...variables, id: 'u343' }
      })

      describe('given posts and comments', () => {
        beforeEach(async () => {
          await factory.create('Category', {
            id: 'cat9',
            name: 'Democracy & Politics',
            icon: 'university',
          })
          await factory.create('Post', {
            author: user,
            id: 'p139',
            content: 'Post by user u343',
            categoryIds,
          })
          await factory.create('Comment', {
            author: user,
            id: 'c155',
            content: 'Comment by user u343',
          })
          await factory.create('Comment', {
            postId: 'p139',
            id: 'c156',
            content: "A comment by someone else on user u343's post",
          })
        })

        it("deletes my account, but doesn't delete posts or comments by default", async () => {
          const expectedResponse = {
            data: {
              DeleteUser: {
                id: 'u343',
                name: 'UNAVAILABLE',
                about: 'UNAVAILABLE',
                deleted: true,
                contributions: [
                  {
                    id: 'p139',
                    content: 'Post by user u343',
                    contentExcerpt: 'Post by user u343',
                    deleted: false,
                    comments: [
                      {
                        id: 'c156',
                        content: "A comment by someone else on user u343's post",
                        contentExcerpt: "A comment by someone else on user u343's post",
                        deleted: false,
                      },
                    ],
                  },
                ],
                comments: [
                  {
                    id: 'c155',
                    content: 'Comment by user u343',
                    contentExcerpt: 'Comment by user u343',
                    deleted: false,
                  },
                ],
              },
            },
          }
          await expect(mutate({ mutation: deleteUserMutation, variables })).resolves.toMatchObject(
            expectedResponse,
          )
        })

        describe('deletion of all post requested', () => {
          beforeEach(() => {
            variables = { ...variables, resource: ['Post'] }
          })

          describe("marks user's posts as deleted", () => {
            it('posts on request', async () => {
              const expectedResponse = {
                data: {
                  DeleteUser: {
                    id: 'u343',
                    name: 'UNAVAILABLE',
                    about: 'UNAVAILABLE',
                    deleted: true,
                    contributions: [
                      {
                        id: 'p139',
                        content: 'UNAVAILABLE',
                        contentExcerpt: 'UNAVAILABLE',
                        deleted: true,
                        comments: [
                          {
                            id: 'c156',
                            content: 'UNAVAILABLE',
                            contentExcerpt: 'UNAVAILABLE',
                            deleted: true,
                          },
                        ],
                      },
                    ],
                    comments: [
                      {
                        id: 'c155',
                        content: 'Comment by user u343',
                        contentExcerpt: 'Comment by user u343',
                        deleted: false,
                      },
                    ],
                  },
                },
              }
              await expect(
                mutate({ mutation: deleteUserMutation, variables }),
              ).resolves.toMatchObject(expectedResponse)
            })
          })
        })

        describe('deletion of all comments requested', () => {
          beforeEach(() => {
            variables = { ...variables, resource: ['Comment'] }
          })

          it('marks comments as deleted', async () => {
            const expectedResponse = {
              data: {
                DeleteUser: {
                  id: 'u343',
                  name: 'UNAVAILABLE',
                  about: 'UNAVAILABLE',
                  deleted: true,
                  contributions: [
                    {
                      id: 'p139',
                      content: 'Post by user u343',
                      contentExcerpt: 'Post by user u343',
                      deleted: false,
                      comments: [
                        {
                          id: 'c156',
                          content: "A comment by someone else on user u343's post",
                          contentExcerpt: "A comment by someone else on user u343's post",
                          deleted: false,
                        },
                      ],
                    },
                  ],
                  comments: [
                    {
                      id: 'c155',
                      content: 'UNAVAILABLE',
                      contentExcerpt: 'UNAVAILABLE',
                      deleted: true,
                    },
                  ],
                },
              },
            }
            await expect(
              mutate({ mutation: deleteUserMutation, variables }),
            ).resolves.toMatchObject(expectedResponse)
          })
        })

        describe('deletion of all post and comments requested', () => {
          beforeEach(() => {
            variables = { ...variables, resource: ['Post', 'Comment'] }
          })

          it('marks posts and comments as deleted', async () => {
            const expectedResponse = {
              data: {
                DeleteUser: {
                  id: 'u343',
                  name: 'UNAVAILABLE',
                  about: 'UNAVAILABLE',
                  deleted: true,
                  contributions: [
                    {
                      id: 'p139',
                      content: 'UNAVAILABLE',
                      contentExcerpt: 'UNAVAILABLE',
                      deleted: true,
                      comments: [
                        {
                          id: 'c156',
                          content: 'UNAVAILABLE',
                          contentExcerpt: 'UNAVAILABLE',
                          deleted: true,
                        },
                      ],
                    },
                  ],
                  comments: [
                    {
                      id: 'c155',
                      content: 'UNAVAILABLE',
                      contentExcerpt: 'UNAVAILABLE',
                      deleted: true,
                    },
                  ],
                },
              },
            }
            await expect(
              mutate({ mutation: deleteUserMutation, variables }),
            ).resolves.toMatchObject(expectedResponse)
          })
        })
      })

      describe('connected `EmailAddress` nodes', () => {
        it('will be removed completely', async () => {
          await expect(neode.all('EmailAddress')).resolves.toHaveLength(2)
          await mutate({ mutation: deleteUserMutation, variables })
          await expect(neode.all('EmailAddress')).resolves.toHaveLength(1)
        })
      })

      describe('connected `SocialMedia` nodes', () => {
        beforeEach(async () => {
          const socialMedia = await factory.create('SocialMedia')
          await socialMedia.relateTo(user, 'ownedBy')
        })

        it('will be removed completely', async () => {
          await expect(neode.all('SocialMedia')).resolves.toHaveLength(1)
          await mutate({ mutation: deleteUserMutation, variables })
          await expect(neode.all('SocialMedia')).resolves.toHaveLength(0)
        })
      })
    })
  })
})
