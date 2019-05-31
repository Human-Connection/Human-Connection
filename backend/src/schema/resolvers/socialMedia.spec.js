import Factory from '../seed/factories'
import { GraphQLClient } from 'graphql-request'
import { host, login } from '../jest/helpers'

const factory = Factory()

describe('CreateSocialMedia', () => {
  let client
  let headers
  const mutationC = `
    mutation($url: String!) {
      CreateSocialMedia(url: $url) {
        id
        url
      }
    }
  `
  const mutationD = `
    mutation($id: ID!) {
      DeleteSocialMedia(id: $id) {
        id
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
      password: '1234',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      client = new GraphQLClient(host)
      const variables = { url: 'http://nsosp.org' }
      await expect(client.request(mutationC, variables)).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      headers = await login({ email: 'test@example.org', password: '1234' })
      client = new GraphQLClient(host, { headers })
    })

    it('creates social media with correct URL', async () => {
      const variables = { url: 'http://nsosp.org' }
      await expect(client.request(mutationC, variables)).resolves.toEqual(
        expect.objectContaining({
          CreateSocialMedia: {
            id: expect.any(String),
            url: 'http://nsosp.org',
          },
        }),
      )
    })

    it('deletes social media', async () => {
      const creationVariables = { url: 'http://nsosp.org' }
      const { CreateSocialMedia } = await client.request(mutationC, creationVariables)
      const { id } = CreateSocialMedia

      const deletionVariables = { id }
      const expected = {
        DeleteSocialMedia: {
          id: id,
          url: 'http://nsosp.org',
        },
      }
      await expect(client.request(mutationD, deletionVariables)).resolves.toEqual(expected)
    })

    it('rejects empty string', async () => {
      const variables = { url: '' }
      await expect(client.request(mutationC, variables)).rejects.toThrow('Input is not a URL')
    })

    it('validates URLs', async () => {
      const variables = { url: 'not-a-url' }
      await expect(client.request(mutationC, variables)).rejects.toThrow('Input is not a URL')
    })
  })
})
