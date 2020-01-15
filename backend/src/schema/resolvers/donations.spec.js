import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

let mutate, query, authenticatedUser, variables
const factory = Factory()
const instance = getNeode()
const driver = getDriver()

const updateDonationsMutation = gql`
  mutation($goal: Int, $progress: Int) {
    UpdateDonations(goal: $goal, progress: $progress) {
      id
      goal
      progress
      createdAt
      updatedAt
    }
  }
`
const donationsQuery = gql`
  query {
    Donations {
      id
      goal
      progress
    }
  }
`

describe('donations', () => {
  let currentUser, newlyCreatedDonations
  beforeAll(async () => {
    await factory.cleanDatabase()
    authenticatedUser = undefined
    const { server } = createServer({
      context: () => {
        return {
          driver,
          neode: instance,
          user: authenticatedUser,
        }
      },
    })
    mutate = createTestClient(server).mutate
    query = createTestClient(server).query
  })

  beforeEach(async () => {
    variables = {}
    newlyCreatedDonations = await factory.create('Donations')
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('query for donations', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = undefined
        await expect(query({ query: donationsQuery, variables })).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })

      describe('authenticated', () => {
        beforeEach(async () => {
          currentUser = await factory.create('User', {
            id: 'normal-user',
            role: 'user',
          })
          authenticatedUser = await currentUser.toJson()
        })

        it('returns the current Donations info', async () => {
          await expect(query({ query: donationsQuery, variables })).resolves.toMatchObject({
            data: { Donations: [{ goal: 15000, progress: 0 }] },
          })
        })
      })
    })
  })

  describe('update donations', () => {
    beforeEach(() => {
      variables = { goal: 20000, progress: 3000 }
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = undefined
        await expect(
          mutate({ mutation: updateDonationsMutation, variables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })

      describe('authenticated', () => {
        describe('as a normal user', () => {
          beforeEach(async () => {
            currentUser = await factory.create('User', {
              id: 'normal-user',
              role: 'user',
            })
            authenticatedUser = await currentUser.toJson()
          })

          it('throws authorization error', async () => {
            await expect(
              mutate({ mutation: updateDonationsMutation, variables }),
            ).resolves.toMatchObject({
              data: { UpdateDonations: null },
              errors: [{ message: 'Not Authorised!' }],
            })
          })
        })

        describe('as a moderator', () => {
          beforeEach(async () => {
            currentUser = await factory.create('User', {
              id: 'moderator',
              role: 'moderator',
            })
            authenticatedUser = await currentUser.toJson()
          })

          it('throws authorization error', async () => {
            await expect(
              mutate({ mutation: updateDonationsMutation, variables }),
            ).resolves.toMatchObject({
              data: { UpdateDonations: null },
              errors: [{ message: 'Not Authorised!' }],
            })
          })
        })

        describe('as an admin', () => {
          beforeEach(async () => {
            currentUser = await factory.create('User', {
              id: 'admin',
              role: 'admin',
            })
            authenticatedUser = await currentUser.toJson()
          })

          it('updates Donations info', async () => {
            await expect(
              mutate({ mutation: updateDonationsMutation, variables }),
            ).resolves.toMatchObject({
              data: { UpdateDonations: { goal: 20000, progress: 3000 } },
              errors: undefined,
            })
          })

          it('updates the updatedAt attribute', async () => {
            newlyCreatedDonations = await newlyCreatedDonations.toJson()
            const {
              data: { UpdateDonations },
            } = await mutate({ mutation: updateDonationsMutation, variables })
            expect(newlyCreatedDonations.updatedAt).toBeTruthy()
            expect(Date.parse(newlyCreatedDonations.updatedAt)).toEqual(expect.any(Number))
            expect(UpdateDonations.updatedAt).toBeTruthy()
            expect(Date.parse(UpdateDonations.updatedAt)).toEqual(expect.any(Number))
            expect(newlyCreatedDonations.updatedAt).not.toEqual(UpdateDonations.updatedAt)
          })
        })
      })
    })
  })
})
