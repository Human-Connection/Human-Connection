import { gql } from '../../../helpers/jest'
import Factory, { cleanDatabase } from '../../../db/factories'
import { getNeode, getDriver } from '../../../db/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'

const neode = getNeode()
const driver = getDriver()
let authenticatedUser, mutate, variables

const signupVerificationMutation = gql`
  mutation(
    $name: String!
    $password: String!
    $email: String!
    $nonce: String!
    $termsAndConditionsAgreedVersion: String!
    $locationName: String
  ) {
    SignupVerification(
      name: $name
      password: $password
      email: $email
      nonce: $nonce
      termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion
      locationName: $locationName
    ) {
      locationName
    }
  }
`

const updateUserMutation = gql`
  mutation($id: ID!, $name: String!, $locationName: String) {
    UpdateUser(id: $id, name: $name, locationName: $locationName) {
      locationName
    }
  }
`

let newlyCreatedNodesWithLocales = [
  {
    city: {
      lat: 41.1534,
      nameES: 'Hamburg',
      nameFR: 'Hamburg',
      nameIT: 'Hamburg',
      nameEN: 'Hamburg',
      type: 'place',
      namePT: 'Hamburg',
      nameRU: 'Хамбург',
      nameDE: 'Hamburg',
      nameNL: 'Hamburg',
      name: 'Hamburg',
      namePL: 'Hamburg',
      id: 'place.5977106083398860',
      lng: -74.5763,
    },
    state: {
      namePT: 'Nova Jérsia',
      nameRU: 'Нью-Джерси',
      nameDE: 'New Jersey',
      nameNL: 'New Jersey',
      nameES: 'Nueva Jersey',
      name: 'New Jersey',
      namePL: 'New Jersey',
      nameFR: 'New Jersey',
      nameIT: 'New Jersey',
      id: 'region.14919479731700330',
      nameEN: 'New Jersey',
      type: 'region',
    },
    country: {
      namePT: 'Estados Unidos',
      nameRU: 'Соединённые Штаты Америки',
      nameDE: 'Vereinigte Staaten',
      nameNL: 'Verenigde Staten van Amerika',
      nameES: 'Estados Unidos',
      namePL: 'Stany Zjednoczone',
      name: 'United States of America',
      nameFR: 'États-Unis',
      nameIT: "Stati Uniti d'America",
      id: 'country.9053006287256050',
      nameEN: 'United States of America',
      type: 'country',
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

afterEach(() => {
  cleanDatabase()
})

describe('userMiddleware', () => {
  describe('SignupVerification', () => {
    beforeEach(async () => {
      variables = {
        ...variables,
        name: 'John Doe',
        password: '123',
        email: 'john@example.org',
        nonce: '123456',
        termsAndConditionsAgreedVersion: '0.1.0',
        locationName: 'Hamburg, New Jersey, United States of America',
      }
      const args = {
        email: 'john@example.org',
        nonce: '123456',
      }
      await neode.model('EmailAddress').create(args)
    })
    it('creates a Location node with localised city/state/country names', async () => {
      await mutate({ mutation: signupVerificationMutation, variables })
      const locations = await neode.cypher(
        `MATCH (city:Location)-[:IS_IN]->(state:Location)-[:IS_IN]->(country:Location) return city, state, country`,
      )
      expect(
        locations.records.map(record => {
          return {
            city: record.get('city').properties,
            state: record.get('state').properties,
            country: record.get('country').properties,
          }
        }),
      ).toEqual(newlyCreatedNodesWithLocales)
    })
  })

  describe('UpdateUser', () => {
    let user
    beforeEach(async () => {
      newlyCreatedNodesWithLocales = [
        {
          city: {
            lat: 53.55,
            nameES: 'Hamburgo',
            nameFR: 'Hambourg',
            nameIT: 'Amburgo',
            nameEN: 'Hamburg',
            type: 'region',
            namePT: 'Hamburgo',
            nameRU: 'Гамбург',
            nameDE: 'Hamburg',
            nameNL: 'Hamburg',
            namePL: 'Hamburg',
            name: 'Hamburg',
            id: 'region.10793468240398860',
            lng: 10,
          },
          country: {
            namePT: 'Alemanha',
            nameRU: 'Германия',
            nameDE: 'Deutschland',
            nameNL: 'Duitsland',
            nameES: 'Alemania',
            name: 'Germany',
            namePL: 'Niemcy',
            nameFR: 'Allemagne',
            nameIT: 'Germania',
            id: 'country.10743216036480410',
            nameEN: 'Germany',
            type: 'country',
          },
        },
      ]
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
        locationName: 'Hamburg, Germany',
      }
      await mutate({ mutation: updateUserMutation, variables })
      const locations = await neode.cypher(
        `MATCH (city:Location)-[:IS_IN]->(country:Location) return city, country`,
      )
      expect(
        locations.records.map(record => {
          return {
            city: record.get('city').properties,
            country: record.get('country').properties,
          }
        }),
      ).toEqual(newlyCreatedNodesWithLocales)
    })
  })
})
