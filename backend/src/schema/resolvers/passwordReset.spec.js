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

      it('creates a reset token', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        const [reset] = resets
        const { token } = reset.properties
        expect(token).toMatch(/^........-....-....-....-............$/)
      })

      it('created PasswordReset is valid for less than 4 minutes', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        const [reset] = resets
        let { validUntil } = reset.properties
        validUntil = Date.parse(validUntil)
        const now = new Date().getTime()
        expect(validUntil).toBeGreaterThan(now - 60 * 1000)
        expect(validUntil).toBeLessThan(now + 4 * 60 * 1000)
      })
    })
  })

  describe('resetPassword', () => {
    const setup = async (options = {}) => {
      const {
        email = 'user@example.org',
        validUntil = new Date().getTime() + 3 * 60 * 1000,
        token = 'abcdefgh-ijkl-mnop-qrst-uvwxyz123456',
      } = options

      const session = driver.session()
      await createPasswordReset({ driver, email, validUntil, token })
      session.close()
    }

    const mutation = `mutation($token: String!, $email: String!, $newPassword: String!) { resetPassword(token: $token, email: $email, newPassword: $newPassword) }`
    let email = 'user@example.org'
    let token = 'abcdefgh-ijkl-mnop-qrst-uvwxyz123456'
    let newPassword = 'supersecret'
    let variables

    describe('invalid email', () => {
      it('resolves to false', async () => {
        await setup()
        variables = { newPassword, email: 'non-existent@example.org', token }
        await expect(client.request(mutation, variables)).resolves.toEqual({ resetPassword: false })
      })
    })

    describe('valid email', () => {
      describe('but invalid token', () => {
        it('resolves to false', async () => {
          await setup()
          variables = { newPassword, email, token: 'slkdjfldsjflsdjfsjdfl' }
          await expect(client.request(mutation, variables)).resolves.toEqual({
            resetPassword: false,
          })
        })
      })

      describe('and valid token', () => {
        beforeEach(() => {
          variables = {
            newPassword,
            email: 'user@example.org',
            token: 'abcdefgh-ijkl-mnop-qrst-uvwxyz123456',
          }
        })

        describe('and token not expired', () => {
          beforeEach(async () => {
            await setup()
          })

          it('resolves to true', async () => {
            await expect(client.request(mutation, variables)).resolves.toEqual({
              resetPassword: true,
            })
          })

          it('updates PasswordReset `redeemedAt` property', async () => {
            await client.request(mutation, variables)
            const requests = await getAllPasswordResets()
            const [request] = requests
            const { redeemedAt } = request.properties
            expect(redeemedAt).not.toBeNull()
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

        describe('but expired token', () => {
          beforeEach(async () => {
            const validUntil = new Date().getTime() - 1000
            await setup({ validUntil })
          })

          it('resolves to false', async () => {
            await expect(client.request(mutation, variables)).resolves.toEqual({
              resetPassword: false,
            })
          })

          it('does not update PasswordReset `redeemedAt` property', async () => {
            await client.request(mutation, variables)
            const requests = await getAllPasswordResets()
            const [request] = requests
            const { redeemedAt } = request.properties
            expect(redeemedAt).toBeUndefined()
          })
        })
      })
    })
  })
})
