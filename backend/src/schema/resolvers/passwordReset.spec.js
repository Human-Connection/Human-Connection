import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host } from '../../jest/helpers'
import { getDriver } from '../../bootstrap/neo4j'
import { createPasswordReset } from './passwordReset'

const factory = Factory()
let client
const driver = getDriver()

const getAllPasswordResets = async () => {
  const session = driver.session()
  let transactionRes = await session.run('MATCH (r:PasswordReset) RETURN r')
  const resets = transactionRes.records.map(record => record.get('r'))
  session.close()
  return resets
}

describe('passwordReset', () => {
  beforeEach(async () => {
    client = new GraphQLClient(host)
    await factory.create('User', {
      email: 'user@example.org',
      role: 'user',
      password: '1234',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('requestPasswordReset', () => {
    const mutation = `mutation($email: String!) { requestPasswordReset(email: $email) }`

    describe('with invalid email', () => {
      const variables = { email: 'non-existent@example.org' }

      it('resolves anyways', async () => {
        await expect(client.request(mutation, variables)).resolves.toEqual({
          requestPasswordReset: true,
        })
      })

      it('creates no node', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        expect(resets).toHaveLength(0)
      })
    })

    describe('with a valid email', () => {
      const variables = { email: 'user@example.org' }

      it('resolves', async () => {
        await expect(client.request(mutation, variables)).resolves.toEqual({
          requestPasswordReset: true,
        })
      })

      it('creates node with label `PasswordReset`', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        expect(resets).toHaveLength(1)
      })

      it('creates a reset code', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        const [reset] = resets
        const { code } = reset.properties
        expect(code).toHaveLength(6)
      })
    })
  })

  describe('resetPassword', () => {
    const setup = async (options = {}) => {
      const {
        email = 'user@example.org',
        issuedAt = new Date(),
        code = 'abcdef',
      } = options

      const session = driver.session()
      await createPasswordReset({ driver, email, issuedAt, code })
      session.close()
    }

    const mutation = `mutation($code: String!, $email: String!, $newPassword: String!) { resetPassword(code: $code, email: $email, newPassword: $newPassword) }`
    let email = 'user@example.org'
    let code = 'abcdef'
    let newPassword = 'supersecret'
    let variables

    describe('invalid email', () => {
      it('resolves to false', async () => {
        await setup()
        variables = { newPassword, email: 'non-existent@example.org', code }
        await expect(client.request(mutation, variables)).resolves.toEqual({ resetPassword: false })
      })
    })

    describe('valid email', () => {
      describe('but invalid code', () => {
        it('resolves to false', async () => {
          await setup()
          variables = { newPassword, email, code: 'slkdjf' }
          await expect(client.request(mutation, variables)).resolves.toEqual({
            resetPassword: false,
          })
        })
      })

      describe('and valid code', () => {
        beforeEach(() => {
          variables = {
            newPassword,
            email: 'user@example.org',
            code: 'abcdef',
          }
        })

        describe('and code not expired', () => {
          beforeEach(async () => {
            await setup()
          })

          it('resolves to true', async () => {
            await expect(client.request(mutation, variables)).resolves.toEqual({
              resetPassword: true,
            })
          })

          it('updates PasswordReset `usedAt` property', async () => {
            await client.request(mutation, variables)
            const requests = await getAllPasswordResets()
            const [request] = requests
            const { usedAt } = request.properties
            expect(usedAt).not.toBeFalsy()
          })

          it('updates password of the user', async () => {
            await client.request(mutation, variables)
            const checkLoginMutation = `
            mutation($email: String!, $password: String!) {
              login(email: $email, password: $password)
            }
            `
            const expected = expect.objectContaining({ login: expect.any(String) })
            await expect(
              client.request(checkLoginMutation, {
                email: 'user@example.org',
                password: 'supersecret',
              }),
            ).resolves.toEqual(expected)
          })
        })

        describe('but expired code', () => {
          beforeEach(async () => {
            const issuedAt = new Date()
            issuedAt.setDate(issuedAt.getDate() - 1)
            await setup({ issuedAt })
          })

          it('resolves to false', async () => {
            await expect(client.request(mutation, variables)).resolves.toEqual({
              resetPassword: false,
            })
          })

          it('does not update PasswordReset `usedAt` property', async () => {
            await client.request(mutation, variables)
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
