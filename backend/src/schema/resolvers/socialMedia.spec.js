import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'

const factory = Factory()

describe('SocialMedia', () => {
  let client, headers, variables, mutation

  const ownerParams = {
    email: 'owner@example.com',
    password: '1234',
    id: '1234',
    name: 'Pippi Langstrumpf',
  }

  const userParams = {
    email: 'someuser@example.com',
    password: 'abcd',
    id: 'abcd',
    name: 'Kalle Blomqvist',
  }

  const url = 'https://twitter.com/pippi-langstrumpf'
  const newUrl = 'https://twitter.com/bullerby'

  const createSocialMediaMutation = gql`
    mutation($url: String!) {
      CreateSocialMedia(url: $url) {
        id
        url
      }
    }
  `
  const updateSocialMediaMutation = gql`
    mutation($id: ID!, $url: String!) {
      UpdateSocialMedia(id: $id, url: $url) {
        id
        url
      }
    }
  `
  const deleteSocialMediaMutation = gql`
    mutation($id: ID!) {
      DeleteSocialMedia(id: $id) {
        id
        url
      }
    }
  `
  beforeEach(async () => {
    await factory.create('User', userParams)
    await factory.create('User', ownerParams)
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('create social media', () => {
    beforeEach(() => {
      variables = { url }
      mutation = createSocialMediaMutation
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        headers = await login(userParams)
        client = new GraphQLClient(host, { headers })
      })

      it('creates social media with correct URL', async () => {
        await expect(client.request(mutation, variables)).resolves.toEqual(
          expect.objectContaining({
            CreateSocialMedia: {
              id: expect.any(String),
              url: url,
            },
          }),
        )
      })

      it('rejects empty string', async () => {
        variables = { url: '' }

        await expect(client.request(mutation, variables)).rejects.toThrow(
          '"url" is not allowed to be empty',
        )
      })

      it('rejects invalid URLs', async () => {
        variables = { url: 'not-a-url' }

        await expect(client.request(createSocialMediaMutation, variables)).rejects.toThrow(
          '"url" must be a valid uri',
        )
      })
    })
  })

  describe('update social media', () => {
    beforeEach(async () => {
      headers = await login(ownerParams)
      client = new GraphQLClient(host, { headers })

      const { CreateSocialMedia } = await client.request(createSocialMediaMutation, { url })
      const { id } = CreateSocialMedia

      variables = { url: newUrl, id }
      mutation = updateSocialMediaMutation
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)
        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated as other user', () => {
      // TODO: make sure it throws an authorization error
    })

    describe('authenticated as owner', () => {
      it('updates social media', async () => {
        const expected = { UpdateSocialMedia: { ...variables } }

        await expect(client.request(mutation, variables)).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })

      describe('given a non-existent id', () => {
        // TODO: make sure it throws an error
      })
    })
  })

  describe('delete social media', () => {
    beforeEach(async () => {
      headers = await login(ownerParams)
      client = new GraphQLClient(host, { headers })

      const { CreateSocialMedia } = await client.request(createSocialMediaMutation, { url })
      const { id } = CreateSocialMedia

      variables = { id }
      mutation = deleteSocialMediaMutation
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        client = new GraphQLClient(host)

        await expect(client.request(mutation, variables)).rejects.toThrow('Not Authorised')
      })
    })

    describe('authenticated as other user', () => {
      // TODO: make sure it throws an authorization error
    })

    describe('authenticated as owner', () => {
      beforeEach(async () => {
        headers = await login(ownerParams)
        client = new GraphQLClient(host, { headers })
      })

      it('deletes social media', async () => {
        const expected = {
          DeleteSocialMedia: {
            id: variables.id,
            url: url,
          },
        }
        await expect(client.request(mutation, variables)).resolves.toEqual(expected)
      })
    })
  })
})
