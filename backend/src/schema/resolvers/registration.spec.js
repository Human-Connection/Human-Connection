import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getDriver, getNeode } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()
const neode = getNeode()

let mutate
let authenticatedUser
let variables
const driver = getDriver()

beforeEach(async () => {
  variables = {}
})

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

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('Signup', () => {
  const mutation = gql`
    mutation($email: String!) {
      Signup(email: $email) {
        email
      }
    }
  `
  beforeEach(() => {
    variables = { ...variables, email: 'someuser@example.org' }
  })

  describe('unauthenticated', () => {
    beforeEach(() => {
      authenticatedUser = null
    })

    it('throws AuthorizationError', async () => {
      await expect(mutate({ mutation, variables })).resolves.toMatchObject({
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

      it('is allowed to signup users by email', async () => {
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
          data: { Signup: { email: 'someuser@example.org' } },
          errors: undefined,
        })
      })

      describe('creates a EmailAddress node', () => {
        it('with `createdAt` attribute', async () => {
          await mutate({ mutation, variables })
          let emailAddress = await neode.first('EmailAddress', { email: 'someuser@example.org' })
          emailAddress = await emailAddress.toJson()
          expect(emailAddress.createdAt).toBeTruthy()
          expect(Date.parse(emailAddress.createdAt)).toEqual(expect.any(Number))
        })

        it('with a cryptographic `nonce`', async () => {
          await mutate({ mutation, variables })
          let emailAddress = await neode.first('EmailAddress', { email: 'someuser@example.org' })
          emailAddress = await emailAddress.toJson()
          expect(emailAddress.nonce).toEqual(expect.any(String))
        })

        describe('if the email already exists', () => {
          let email
          beforeEach(async () => {
            email = await factory.create('EmailAddress', {
              email: 'someuser@example.org',
              verifiedAt: null,
            })
          })

          describe('and the user has registered already', () => {
            beforeEach(async () => {
              await factory.create('User', { email })
            })

            it('throws UserInputError error because of unique constraint violation', async () => {
              await expect(mutate({ mutation, variables })).resolves.toMatchObject({
                errors: [{ message: 'A user account with this email already exists.' }],
              })
            })
          })

          describe('but the user has not yet registered', () => {
            it('resolves with the already existing email', async () => {
              await expect(mutate({ mutation, variables })).resolves.toMatchObject({
                data: { Signup: { email: 'someuser@example.org' } },
                errors: undefined,
              })
            })

            it('creates no additional `EmailAddress` node', async () => {
              // admin account and the already existing user
              await expect(neode.all('EmailAddress')).resolves.toHaveLength(2)
              await expect(mutate({ mutation, variables })).resolves.toMatchObject({
                data: { Signup: { email: 'someuser@example.org' } },
                errors: undefined,
              })
              await expect(neode.all('EmailAddress')).resolves.toHaveLength(2)
            })
          })
        })
      })
    })
  })
})

describe('SignupVerification', () => {
  const mutation = gql`
    mutation(
      $name: String!
      $password: String!
      $email: String!
      $nonce: String!
      $about: String
      $termsAndConditionsAgreedVersion: String!
      $locale: String
    ) {
      SignupVerification(
        name: $name
        password: $password
        email: $email
        nonce: $nonce
        about: $about
        termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
        locale: $locale
      ) {
        id
        termsAndConditionsAgreedVersion
        termsAndConditionsAgreedAt
      }
    }
  `
  describe('given valid password and email', () => {
    beforeEach(async () => {
      variables = {
        ...variables,
        nonce: '123456',
        name: 'John Doe',
        password: '123',
        email: 'john@example.org',
        termsAndConditionsAgreedVersion: '0.1.0',
        locale: 'en',
      }
    })

    describe('unauthenticated', () => {
      beforeEach(async () => {
        authenticatedUser = null
      })

      describe('EmailAddress exists, but is already related to a user account', () => {
        beforeEach(async () => {
          const { email, nonce } = variables
          const [emailAddress, user] = await Promise.all([
            neode.model('EmailAddress').create({ email, nonce }),
            neode
              .model('User')
              .create({ name: 'Somebody', password: '1234', email: 'john@example.org' }),
          ])
          await emailAddress.relateTo(user, 'belongsTo')
        })

        describe('sending a valid nonce', () => {
          beforeEach(() => {
            variables = { ...variables, nonce: '123456' }
          })

          it('rejects', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid email or nonce' }],
            })
          })
        })
      })

      describe('disconnected EmailAddress exists', () => {
        beforeEach(async () => {
          const args = {
            email: 'john@example.org',
            nonce: '123456',
          }
          await neode.model('EmailAddress').create(args)
        })

        describe('sending a valid nonce', () => {
          it('creates a user account', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  id: expect.any(String),
                }),
              },
            })
          })

          it('sets `verifiedAt` attribute of EmailAddress', async () => {
            await mutate({ mutation, variables })
            const email = await neode.first('EmailAddress', { email: 'john@example.org' })
            await expect(email.toJson()).resolves.toEqual(
              expect.objectContaining({
                verifiedAt: expect.any(String),
              }),
            )
          })

          it('connects User with EmailAddress', async () => {
            const cypher = `
                MATCH(email:EmailAddress)-[:BELONGS_TO]->(u:User {name: {name}})
                RETURN email
              `
            await mutate({ mutation, variables })
            const { records: emails } = await neode.cypher(cypher, { name: 'John Doe' })
            expect(emails).toHaveLength(1)
          })

          it('sets `about` attribute of User', async () => {
            variables = { ...variables, about: 'Find this description in the user profile' }
            await mutate({ mutation, variables })
            const user = await neode.first('User', { name: 'John Doe' })
            await expect(user.toJson()).resolves.toMatchObject({
              about: 'Find this description in the user profile',
            })
          })

          it('allowing the about field to be an empty string', async () => {
            variables = { ...variables, about: '' }
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  id: expect.any(String),
                }),
              },
            })
          })

          it('marks the EmailAddress as primary', async () => {
            const cypher = `
                MATCH(email:EmailAddress)<-[:PRIMARY_EMAIL]-(u:User {name: {name}})
                RETURN email
              `
            await mutate({ mutation, variables })
            const { records: emails } = await neode.cypher(cypher, { name: 'John Doe' })
            expect(emails).toHaveLength(1)
          })

          it('updates termsAndConditionsAgreedVersion', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  termsAndConditionsAgreedVersion: '0.1.0',
                }),
              },
            })
          })

          it('updates termsAndConditionsAgreedAt', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: {
                SignupVerification: expect.objectContaining({
                  termsAndConditionsAgreedAt: expect.any(String),
                }),
              },
            })
          })

          it('rejects if version of terms and conditions is missing', async () => {
            variables = { ...variables, termsAndConditionsAgreedVersion: null }
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [
                {
                  message:
                    'Variable "$termsAndConditionsAgreedVersion" of non-null type "String!" must not be null.',
                },
              ],
            })
          })

          it('rejects if version of terms and conditions has wrong format', async () => {
            variables = { ...variables, termsAndConditionsAgreedVersion: 'invalid version format' }
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid version format!' }],
            })
          })
        })

        describe('sending invalid nonce', () => {
          beforeEach(() => {
            variables = { ...variables, nonce: 'wut2' }
          })

          it('rejects', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              errors: [{ message: 'Invalid email or nonce' }],
            })
          })
        })
      })
    })
  })
})
