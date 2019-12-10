import Factory from '../seed/factories'
import { gql } from '../helpers/jest'
import { getNeode, getDriver } from '../bootstrap/neo4j'
import createServer from '../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()

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
  mutate = createTestClient(server).mutate
})

beforeEach(async () => {
  variables = {}
  const admin = await factory.create('User', {
    role: 'admin',
  })
  await factory.create('User', {
    email: 'someone@example.org',
    password: '1234',
  })
  await factory.create('Category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    icon: 'university',
  })
  authenticatedUser = await admin.toJson()
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('slugifyMiddleware', () => {
  describe('CreatePost', () => {
    const categoryIds = ['cat9']
    const createPostMutation = gql`
      mutation($title: String!, $content: String!, $categoryIds: [ID]!, $slug: String) {
        CreatePost(title: $title, content: $content, categoryIds: $categoryIds, slug: $slug) {
          slug
        }
      }
    `

    beforeEach(() => {
      variables = {
        ...variables,
        title: 'I am a brand new post',
        content: 'Some content',
        categoryIds,
      }
    })

    it('generates a slug based on title', async () => {
      await expect(
        mutate({
          mutation: createPostMutation,
          variables,
        }),
      ).resolves.toMatchObject({
        data: {
          CreatePost: {
            slug: 'i-am-a-brand-new-post',
          },
        },
      })
    })

    describe('if slug exists', () => {
      beforeEach(async () => {
        await factory.create('Post', {
          title: 'Pre-existing post',
          slug: 'pre-existing-post',
          content: 'as Someone else content',
          categoryIds,
        })
      })

      it('chooses another slug', async () => {
        variables = {
          ...variables,
          title: 'Pre-existing post',
          content: 'Some content',
          categoryIds,
        }
        await expect(
          mutate({
            mutation: createPostMutation,
            variables,
          }),
        ).resolves.toMatchObject({
          data: {
            CreatePost: {
              slug: 'pre-existing-post-1',
            },
          },
        })
      })

      describe('but if the client specifies a slug', () => {
        it('rejects CreatePost', async done => {
          variables = {
            ...variables,
            title: 'Pre-existing post',
            content: 'Some content',
            slug: 'pre-existing-post',
            categoryIds,
          }
          try {
            await expect(
              mutate({ mutation: createPostMutation, variables }),
            ).resolves.toMatchObject({
              errors: [
                {
                  message: 'Post with this slug already exists!',
                },
              ],
            })
            done()
          } catch (error) {
            throw new Error(`
              ${error}

              Probably your database has no unique constraints!

              To see all constraints go to http://localhost:7474/browser/ and
              paste the following:
              \`\`\`
                CALL db.constraints();
              \`\`\`

              Learn how to setup the database here:
              https://docs.human-connection.org/human-connection/neo4j
            `)
          }
        })
      })
    })
  })

  describe('SignupVerification', () => {
    const mutation = gql`
      mutation(
        $password: String!
        $email: String!
        $name: String!
        $slug: String
        $nonce: String!
        $termsAndConditionsAgreedVersion: String!
      ) {
        SignupVerification(
          email: $email
          password: $password
          name: $name
          slug: $slug
          nonce: $nonce
          termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
        ) {
          slug
        }
      }
    `

    beforeEach(() => {
      variables = {
        ...variables,
        name: 'I am a user',
        nonce: '123456',
        password: 'yo',
        email: '123@example.org',
        termsAndConditionsAgreedVersion: '0.0.1',
      }
    })

    describe('given a user has signed up with their email address', () => {
      beforeEach(async () => {
        await factory.create('EmailAddress', {
          email: '123@example.org',
          nonce: '123456',
          verifiedAt: null,
        })
      })

      it('generates a slug based on name', async () => {
        await expect(
          mutate({
            mutation,
            variables,
          }),
        ).resolves.toMatchObject({
          data: {
            SignupVerification: {
              slug: 'i-am-a-user',
            },
          },
        })
      })

      describe('if slug exists', () => {
        beforeEach(async () => {
          await factory.create('User', {
            name: 'I am a user',
            slug: 'i-am-a-user',
          })
        })

        it('chooses another slug', async () => {
          await expect(
            mutate({
              mutation,
              variables,
            }),
          ).resolves.toMatchObject({
            data: {
              SignupVerification: {
                slug: 'i-am-a-user-1',
              },
            },
          })
        })

        describe('but if the client specifies a slug', () => {
          beforeEach(() => {
            variables = {
              ...variables,
              slug: 'i-am-a-user',
            }
          })

          it('rejects SignupVerification (on FAIL Neo4j constraints may not defined in database)', async () => {
            await expect(
              mutate({
                mutation,
                variables,
              }),
            ).resolves.toMatchObject({
              errors: [
                {
                  message: 'User with this slug already exists!',
                },
              ],
            })
          })
        })
      })
    })
  })
})
