import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'
import { createTestClient } from 'apollo-server-testing'

const factory = Factory()

let mutate, authenticatedUser

const driver = getDriver()
const neode = getNeode()

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

describe('resolvers', () => {
  describe('Location', () => {
    describe('custom mutation, not handled by neo4j-graphql-js', () => {
      let variables
      const updateUserMutation = gql`
        mutation($id: ID!, $name: String) {
          UpdateUser(id: $id, name: $name) {
            name
            location {
              name: nameRU
              nameEN
            }
          }
        }
      `

      beforeEach(async () => {
        variables = {
          id: 'u47',
          name: 'John Doughnut',
        }
        const Paris = await factory.create('Location', {
          id: 'region.9397217726497330',
          name: 'Paris',
          type: 'region',
          lat: 2.35183,
          lng: 48.85658,
          nameEN: 'Paris',
        })

        const user = await factory.create('User', {
          id: 'u47',
          name: 'John Doe',
        })
        await user.relateTo(Paris, 'isIn')
        authenticatedUser = await user.toJson()
      })

      it('returns `null` if location translation is not available', async () => {
        await expect(mutate({ mutation: updateUserMutation, variables })).resolves.toMatchObject({
          data: {
            UpdateUser: {
              name: 'John Doughnut',
              location: {
                name: null,
                nameEN: 'Paris',
              },
            },
          },
          errors: undefined,
        })
      })
    })
  })
})
