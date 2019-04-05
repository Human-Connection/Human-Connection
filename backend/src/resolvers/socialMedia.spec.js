import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('CreateSocialMedia', () => {
  let client
  let headers
  const mutation = `
    mutation($url: String!) {
      CreateSocialMedia(url: $url) {
        url
      }
    }
  `
  beforeEach(async () => {
    await factory.create('User', {
      avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/jimmuirhead/128.jpg',
      id: 'acb2d923-f3af-479e-9f00-61b12e864666',
      name: 'Matilde Hermiston',
      slug: 'matilde-hermiston',
      role: 'user',
      email: 'test@example.org',
      password: '1234'
    })
  })
  
  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    it('rejects empty string', async () => {
      const variables = { url: '' }
      await expect(client.request(mutation, variables)).rejects.toThrow('Input is not a URL')
    })

    it('validates URLs', async () => {
      const variables = { url: 'not-a-url' }
      await expect(client.request(mutation, variables)).rejects.toThrow('Input is not a URL')
    })
  })
})