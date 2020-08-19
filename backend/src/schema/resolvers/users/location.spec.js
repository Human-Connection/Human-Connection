import { gql } from '../../../helpers/jest'
import Factory, { cleanDatabase } from '../../../db/factories'
import { getNeode, getDriver } from '../../../db/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'

const neode = getNeode()
const driver = getDriver()
let authenticatedUser, mutate, variables

const updateUserMutation = gql`
  mutation($id: ID!, $name: String!, $locationName: String) {
    UpdateUser(id: $id, name: $name, locationName: $locationName) {
      locationName
    }
  }
`

const newlyCreatedNodesWithLocales = [
  {
    city: {
      id: expect.stringContaining('place'),
      type: 'place',
      name: 'Hamburg',
      nameEN: 'Hamburg',
      nameDE: 'Hamburg',
      namePT: 'Hamburg',
      nameES: 'Hamburg',
      nameFR: 'Hamburg',
      nameIT: 'Hamburg',
      nameRU: 'Хамбург',
      nameNL: 'Hamburg',
      namePL: 'Hamburg',
      lng: -74.5763,
      lat: 41.1534,
    },
    state: {
      id: expect.stringContaining('region'),
      type: 'region',
      name: 'New Jersey',
      nameEN: 'New Jersey',
      nameDE: 'New Jersey',
      namePT: 'Nova Jérsia',
      nameES: 'Nueva Jersey',
      nameFR: 'New Jersey',
      nameIT: 'New Jersey',
      nameRU: 'Нью-Джерси',
      nameNL: 'New Jersey',
      namePL: 'New Jersey',
    },
    country: {
      id: expect.stringContaining('country'),
      type: 'country',
      name: 'United States',
      nameEN: 'United States',
      nameDE: 'Vereinigte Staaten',
      namePT: 'Estados Unidos',
      nameES: 'Estados Unidos',
      nameFR: 'États-Unis',
      nameIT: "Stati Uniti d'America",
      nameRU: 'Соединённые Штаты Америки',
      nameNL: 'Verenigde Staten van Amerika',
      namePL: 'Stany Zjednoczone',
    },
  },
]

beforeAll(() => {
  const { server } = createServer({
    context: () => {
      return {
        user: authenticatedUser,
        neode,
        driver,
      }
    },
  })
  mutate = createTestClient(server).mutate
})

beforeEach(() => {
  variables = {}
  authenticatedUser = null
})

afterEach(cleanDatabase)

describe('userMiddleware', () => {
  describe('UpdateUser', () => {
    let user
    beforeEach(async () => {
      user = await Factory.build('user', {
        id: 'updating-user',
      })
      authenticatedUser = await user.toJson()
    })

    it('creates a Location node with localised city/state/country names', async () => {
      variables = {
        ...variables,
        id: 'updating-user',
        name: 'Updating user',
        locationName: 'Hamburg, New Jersey, United States of America',
      }
      await mutate({ mutation: updateUserMutation, variables })
      const locations = await neode.cypher(
        `MATCH (city:Location)-[:IS_IN]->(state:Location)-[:IS_IN]->(country:Location) return city {.*}, state {.*}, country {.*}`,
      )
      expect(
        locations.records.map((record) => {
          return {
            city: record.get('city'),
            state: record.get('state'),
            country: record.get('country'),
          }
        }),
      ).toEqual(newlyCreatedNodesWithLocales)
    })
  })
})
