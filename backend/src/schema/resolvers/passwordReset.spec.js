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
    const variables = { email: 'user@example.org' }
    const mutation = `mutation($email: String!) { requestPasswordReset(email: $email) }`

    it('resolves', async () => {
      await expect(client.request(mutation, variables)).resolves.toEqual(true)
    })

    it('creates node with label `PasswordReset`', async () => {
      await client.request(mutation, variables)
      const resets = await getAllPasswordResets()
      expect(resets).toHaveLength(1)
    })
  })
})
