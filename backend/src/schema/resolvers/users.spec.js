import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const categoryIds = ['cat9']
let user
let admin
let authenticatedUser

let query
let mutate
let variables

const driver = getDriver()
const neode = getNeode()

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

beforeEach(async () => {
  await cleanDatabase()
})

describe('User', () => {
  describe('query by email address', () => {
    let userQuery

    beforeEach(async () => {
      userQuery = gql`
        query($email: String) {
          User(email: $email) {
            name
          }
        }
      `
      variables = {
        email: 'any-email-address@example.org',
      }
      await Factory.build('user', { name: 'Johnny' }, { email: 'any-email-address@example.org' })
    })

    it('is forbidden', async () => {
      await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
        errors: [{ message: 'Not Authorised!' }],
      })
    })

    describe('as admin', () => {
      beforeEach(async () => {
        const admin = await Factory.build(
          'user',
          {
            role: 'admin',
          },
          {
            email: 'admin@example.org',
            password: '1234',
          },
        )
        authenticatedUser = await admin.toJson()
      })

      it('is permitted', async () => {
        await expect(query({ query: userQuery, variables })).resolves.toMatchObject({
          data: { User: [{ name: 'Johnny' }] },
          errors: undefined,
        })
      })

      it('non-existing email address, issue #2294', async () => {
        // see: https://github.com/Human-Connection/Human-Connection/issues/2294
        await expect(
          query({
            query: userQuery,
            variables: {
              email: 'this-email-does-not-exist@example.org',
            },
          }),
        ).resolves.toMatchObject({
          data: { User: [] },
          errors: undefined,
        })
      })
    })
  })
})

describe('UpdateUser', () => {
  let updateUserMutation

  beforeEach(async () => {
    updateUserMutation = gql`
      mutation(
        $id: ID!
        $name: String
        $termsAndConditionsAgreedVersion: String
        $locationName: String
      ) {
        UpdateUser(
          id: $id
          name: $name
          termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
          locationName: $locationName
        ) {
          id
          name
          termsAndConditionsAgreedVersion
          termsAndConditionsAgreedAt
          locationName
        }
      }
    `
    variables = {
      id: 'u47',
      name: 'John Doughnut',
    }

    user = await Factory.build(
      'user',
      {
        id: 'u47',
        name: 'John Doe',
        termsAndConditionsAgreedVersion: null,
        termsAndConditionsAgreedAt: null,
        allowEmbedIframes: false,
      },
      {
        email: 'user@example.org',
      },
    )
  })

  describe('as another user', () => {
    beforeEach(async () => {
      const someoneElse = await Factory.build(
        'user',
        {
          name: 'James Doe',
        },
        {
          email: 'someone-else@example.org',
        },
      )

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

    it('updates the name', async () => {
      const expected = {
        data: {
          UpdateUser: {
            id: 'u47',
            name: 'John Doughnut',
          },
        },
        errors: undefined,
      }
      await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject(
        expected,
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
          errors: undefined,
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
          errors: undefined,
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

    it('supports updating location', async () => {
      variables = { ...variables, locationName: 'Hamburg, New Jersey, United States of America' }
      await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject({
        data: { UpdateUser: { locationName: 'Hamburg, New Jersey, United States of America' } },
        errors: undefined,
      })
    })
  })
})

describe('Delete a User as admin', () => {
  beforeEach(async () => {
    variables = { id: ' u343', resource: [] }

    user = await Factory.build('user', {
      name: 'My name should be deleted',
      about: 'along with my about',
      id: 'u343',
    })
  })

  describe('authenticated as Admin', () => {
    beforeEach(async () => {
      admin = await Factory.build(
        'user',
        {
          role: 'admin',
        },
        {
          email: 'admin@example.org',
          password: '1234',
        },
      )
      authenticatedUser = await admin.toJson()
    })

    describe('deleting a user account', () => {
      beforeEach(() => {
        variables = { ...variables, id: 'u343' }
      })

      describe('given posts and comments', () => {
        beforeEach(async () => {
          await Factory.build('category', {
            id: 'cat9',
            name: 'Democracy & Politics',
            icon: 'university',
          })
          await Factory.build(
            'post',
            {
              id: 'p139',
              content: 'Post by user u343',
            },
            {
              author: user,
              categoryIds,
            },
          )
          await Factory.build(
            'comment',
            {
              id: 'c155',
              content: 'Comment by user u343',
            },
            {
              author: user,
            },
          )
          await Factory.build(
            'comment',
            {
              id: 'c156',
              content: "A comment by someone else on user u343's post",
            },
            {
              postId: 'p139',
            },
          )
        })

        it("deletes account, but doesn't delete posts or comments by default", async () => {
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
            errors: undefined,
          }
          await expect(mutate({ mutation: deleteUserMutation, variables })).resolves.toMatchObject(
            expectedResponse,
          )
        })

        describe('deletion of all posts and comments requested', () => {
          beforeEach(() => {
            variables = { ...variables, resource: ['Comment', 'Post'] }
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
              errors: undefined,
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
          const socialMedia = await Factory.build('socialMedia')
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
