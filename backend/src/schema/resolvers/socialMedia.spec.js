import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'
import Factory from '../../seed/factories'
import { gql } from '../../jest/helpers'
import { neode, getDriver } from '../../bootstrap/neo4j'

const driver = getDriver()
const factory = Factory()
const instance = neode()

describe('SocialMedia', () => {
  let socialMediaAction, someUser, ownerNode, owner

  const ownerParams = {
    email: 'pippi@example.com',
    password: '1234',
    name: 'Pippi Langstrumpf',
  }

  const userParams = {
    email: 'kalle@example.com',
    password: 'abcd',
    name: 'Kalle Blomqvist',
  }

  const url = 'https://twitter.com/pippi-langstrumpf'
  const newUrl = 'https://twitter.com/bullerby'

  const setUpSocialMedia = async () => {
    const socialMediaNode = await instance.create('SocialMedia', { url })
    await socialMediaNode.relateTo(ownerNode, 'ownedBy')
    return socialMediaNode.toJson()
  }

  beforeEach(async () => {
    const someUserNode = await instance.create('User', userParams)
    someUser = await someUserNode.toJson()
    ownerNode = await instance.create('User', ownerParams)
    owner = await ownerNode.toJson()

    socialMediaAction = async (user, mutation, variables) => {
      const { server } = createServer({
        context: () => {
          return {
            user,
            driver,
          }
        },
      })
      const { mutate } = createTestClient(server)

      return mutate({
        mutation,
        variables,
      })
    }
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('create social media', () => {
    let mutation, variables

    beforeEach(() => {
      mutation = gql`
        mutation($url: String!) {
          CreateSocialMedia(url: $url) {
            id
            url
          }
        }
      `
      variables = { url }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const user = null
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated', () => {
      let user

      beforeEach(() => {
        user = owner
      })

      it('creates social media with the given url', async () => {
        await expect(socialMediaAction(user, mutation, variables)).resolves.toEqual(
          expect.objectContaining({
            data: {
              CreateSocialMedia: {
                id: expect.any(String),
                url,
              },
            },
          }),
        )
      })

      it('rejects an empty string as url', async () => {
        variables = { url: '' }
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0].message).toEqual(
          expect.stringContaining('"url" is not allowed to be empty'),
        )
      })

      it('rejects invalid urls', async () => {
        variables = { url: 'not-a-url' }
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0].message).toEqual(
          expect.stringContaining('"url" must be a valid uri'),
        )
      })
    })

    describe('ownedBy', () => {
      beforeEach(() => {
        mutation = gql`
          mutation($url: String!) {
            CreateSocialMedia(url: $url) {
              url
              ownedBy {
                name
              }
            }
          }
        `
      })

      it('resolves', async () => {
        const user = someUser
        await expect(socialMediaAction(user, mutation, variables)).resolves.toEqual(
          expect.objectContaining({
            data: {
              CreateSocialMedia: { url, ownedBy: { name: 'Kalle Blomqvist' } },
            },
          }),
        )
      })
    })
  })

  describe('update social media', () => {
    let mutation, variables

    beforeEach(async () => {
      const socialMedia = await setUpSocialMedia()

      mutation = gql`
        mutation($id: ID!, $url: String!) {
          UpdateSocialMedia(id: $id, url: $url) {
            id
            url
          }
        }
      `
      variables = { url: newUrl, id: socialMedia.id }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const user = null
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as other user', () => {
      it('throws authorization error', async () => {
        const user = someUser
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as owner', () => {
      let user

      beforeEach(() => {
        user = owner
      })

      it('updates social media with the given id', async () => {
        const expected = {
          data: {
            UpdateSocialMedia: { ...variables },
          },
        }

        await expect(socialMediaAction(user, mutation, variables)).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })

      it('does not update if the the given id does not exist', async () => {
        variables.id = 'some-id'
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })
  })

  describe('delete social media', () => {
    let mutation, variables

    beforeEach(async () => {
      const socialMedia = await setUpSocialMedia()

      mutation = gql`
        mutation($id: ID!) {
          DeleteSocialMedia(id: $id) {
            id
            url
          }
        }
      `
      variables = { url: newUrl, id: socialMedia.id }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        const user = null
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as other user', () => {
      it('throws authorization error', async () => {
        const user = someUser
        const result = await socialMediaAction(user, mutation, variables)

        expect(result.errors[0]).toHaveProperty('message', 'Not Authorised!')
      })
    })

    describe('authenticated as owner', () => {
      let user

      beforeEach(async () => {
        user = owner
      })

      it('deletes social media with the given id', async () => {
        const expected = {
          data: {
            DeleteSocialMedia: {
              id: variables.id,
              url,
            },
          },
        }

        await expect(socialMediaAction(user, mutation, variables)).resolves.toEqual(
          expect.objectContaining(expected),
        )
      })
    })
  })
})
