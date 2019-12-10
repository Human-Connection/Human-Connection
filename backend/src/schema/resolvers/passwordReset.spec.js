import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import createPasswordReset from './helpers/createPasswordReset'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const neode = getNeode()
const driver = getDriver()
const factory = Factory()

let mutate
let authenticatedUser
let variables

const getAllPasswordResets = async () => {
  const session = driver.session()
  try {
    const transactionRes = await session.run('MATCH (r:PasswordReset) RETURN r')
    const resets = transactionRes.records.map(record => record.get('r'))
    return resets
  } finally {
    session.close()
  }
}

beforeEach(() => {
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

describe('passwordReset', () => {
  describe('given a user', () => {
    beforeEach(async () => {
      await factory.create('User', {
        email: 'user@example.org',
      })
    })

    describe('requestPasswordReset', () => {
      const mutation = gql`
        mutation($email: String!) {
          requestPasswordReset(email: $email)
        }
      `

      describe('with invalid email', () => {
        beforeEach(() => {
          variables = { ...variables, email: 'non-existent@example.org' }
        })

        it('resolves anyways', async () => {
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { requestPasswordReset: true },
          })
        })

        it('creates no node', async () => {
          await mutate({ mutation, variables })
          const resets = await getAllPasswordResets()
          expect(resets).toHaveLength(0)
        })
      })

      describe('with a valid email', () => {
        beforeEach(() => {
          variables = { ...variables, email: 'user@example.org' }
        })

        it('resolves', async () => {
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { requestPasswordReset: true },
          })
        })

        it('creates node with label `PasswordReset`', async () => {
          let resets = await getAllPasswordResets()
          expect(resets).toHaveLength(0)
          await mutate({ mutation, variables })
          resets = await getAllPasswordResets()
          expect(resets).toHaveLength(1)
        })

        it('creates a reset nonce', async () => {
          await mutate({ mutation, variables })
          const resets = await getAllPasswordResets()
          const [reset] = resets
          const { nonce } = reset.properties
          expect(nonce).toHaveLength(6)
        })
      })
    })
  })
})

describe('resetPassword', () => {
  const setup = async (options = {}) => {
    const { email = 'user@example.org', issuedAt = new Date(), nonce = 'abcdef' } = options
    await createPasswordReset({ driver, email, issuedAt, nonce })
  }

  const mutation = gql`
    mutation($nonce: String!, $email: String!, $newPassword: String!) {
      resetPassword(nonce: $nonce, email: $email, newPassword: $newPassword)
    }
  `
  beforeEach(() => {
    variables = { ...variables, newPassword: 'supersecret' }
  })

  describe('given a user', () => {
    beforeEach(async () => {
      await factory.create('User', {
        email: 'user@example.org',
        role: 'user',
        password: '1234',
      })
    })

    describe('invalid email', () => {
      it('resolves to false', async () => {
        await setup()
        variables = { ...variables, email: 'non-existent@example.org', nonce: 'abcdef' }
        await expect(mutate({ mutation, variables })).resolves.toMatchObject({
          data: { resetPassword: false },
        })
      })
    })

    describe('valid email', () => {
      beforeEach(() => {
        variables = { ...variables, email: 'user@example.org' }
      })

      describe('but invalid nonce', () => {
        beforeEach(() => {
          variables = { ...variables, nonce: 'slkdjf' }
        })

        it('resolves to false', async () => {
          await setup()
          await expect(mutate({ mutation, variables })).resolves.toMatchObject({
            data: { resetPassword: false },
          })
        })
      })

      describe('and valid nonce', () => {
        beforeEach(() => {
          variables = {
            ...variables,
            nonce: 'abcdef',
          }
        })

        describe('and nonce not expired', () => {
          beforeEach(async () => {
            await setup()
          })

          it('resolves to true', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: { resetPassword: true },
            })
          })

          it('updates PasswordReset `usedAt` property', async () => {
            await mutate({ mutation, variables })
            const requests = await getAllPasswordResets()
            const [request] = requests
            const { usedAt } = request.properties
            expect(usedAt).not.toBeFalsy()
          })

          it('updates password of the user', async () => {
            await mutate({ mutation, variables })
            const checkLoginMutation = gql`
              mutation($email: String!, $password: String!) {
                login(email: $email, password: $password)
              }
            `
            variables = { ...variables, email: 'user@example.org', password: 'supersecret' }
            await expect(
              mutate({ mutation: checkLoginMutation, variables }),
            ).resolves.toMatchObject({ data: { login: expect.any(String) } })
          })
        })

        describe('but expired nonce', () => {
          beforeEach(async () => {
            const issuedAt = new Date()
            issuedAt.setDate(issuedAt.getDate() - 1)
            await setup({ issuedAt })
          })

          it('resolves to false', async () => {
            await expect(mutate({ mutation, variables })).resolves.toMatchObject({
              data: { resetPassword: false },
            })
          })

          it('does not update PasswordReset `usedAt` property', async () => {
            await mutate({ mutation, variables })
            const requests = await getAllPasswordResets()
            const [request] = requests
            const { usedAt } = request.properties
            expect(usedAt).toBeUndefined()
          })
        })
      })
    })
  })
})
