import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login } from '../../jest/helpers'
import { getDriver } from '../../bootstrap/neo4j'

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
        await expect(client.request(mutation, variables)).resolves.toEqual({"requestPasswordReset": true})
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
        await expect(client.request(mutation, variables)).resolves.toEqual({"requestPasswordReset": true})
      })

      it('creates node with label `PasswordReset`', async () => {
        await client.request(mutation, variables)
        const resets = await getAllPasswordResets()
        expect(resets).toHaveLength(1)
      })

      it('creates an id used as a reset token', async () => {
        await client.request(mutation, variables)
        const [reset] = await getAllPasswordResets()
        const { id: token } = reset.properties
        expect(token).toMatch(/^........-....-....-....-............$/)
      })

      it('created PasswordReset is valid for less than 4 minutes', async () => {
        await client.request(mutation, variables)
        const [reset] = await getAllPasswordResets()
        let { validUntil } = reset.properties
        validUntil = Date.parse(validUntil)
        const now = (new Date()).getTime()
        expect(validUntil).toBeGreaterThan(now - 60*1000)
        expect(validUntil).toBeLessThan(now + 4*60*1000)
      })
    })
  })
})
