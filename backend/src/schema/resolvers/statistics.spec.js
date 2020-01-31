import { createTestClient } from 'apollo-server-testing'
import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../db/neo4j'
import createServer from '../../server'

let query, authenticatedUser
const instance = getNeode()
const driver = getDriver()

const statisticsQuery = gql`
  query {
    statistics {
      countUsers
      countPosts
      countComments
      countNotifications
      countInvites
      countFollows
      countShouts
    }
  }
`
beforeAll(() => {
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
  query = createTestClient(server).query
})

afterEach(async () => {
  await cleanDatabase()
})

describe('statistics', () => {
  describe('countUsers', () => {
    beforeEach(async () => {
      await Promise.all(
        [...Array(6).keys()].map(() => {
          return Factory.build('user')
        }),
      )
    })

    it('returns the count of all users', async () => {
      await expect(query({ query: statisticsQuery })).resolves.toMatchObject({
        data: { statistics: { countUsers: 6 } },
        errors: undefined,
      })
    })
  })

  describe('countPosts', () => {
    beforeEach(async () => {
      await Promise.all(
        [...Array(3).keys()].map(() => {
          return Factory.build('post')
        }),
      )
    })

    it('returns the count of all posts', async () => {
      await expect(query({ query: statisticsQuery })).resolves.toMatchObject({
        data: { statistics: { countPosts: 3 } },
        errors: undefined,
      })
    })
  })

  describe('countComments', () => {
    beforeEach(async () => {
      await Promise.all(
        [...Array(2).keys()].map(() => {
          return Factory.build('comment')
        }),
      )
    })

    it('returns the count of all comments', async () => {
      await expect(query({ query: statisticsQuery })).resolves.toMatchObject({
        data: { statistics: { countComments: 2 } },
        errors: undefined,
      })
    })
  })

  describe('countFollows', () => {
    let users
    beforeEach(async () => {
      users = await Promise.all(
        [...Array(2).keys()].map(() => {
          return Factory.build('user')
        }),
      )
      await users[0].relateTo(users[1], 'following')
    })

    it('returns the count of all follows', async () => {
      await expect(query({ query: statisticsQuery })).resolves.toMatchObject({
        data: { statistics: { countFollows: 1 } },
        errors: undefined,
      })
    })
  })

  describe('countShouts', () => {
    let users, posts
    beforeEach(async () => {
      users = await Promise.all(
        [...Array(2).keys()].map(() => {
          return Factory.build('user')
        }),
      )
      posts = await Promise.all(
        [...Array(3).keys()].map(() => {
          return Factory.build('post')
        }),
      )
      await Promise.all([
        users[0].relateTo(posts[1], 'shouted'),
        users[1].relateTo(posts[0], 'shouted'),
      ])
    })

    it('returns the count of all shouts', async () => {
      await expect(query({ query: statisticsQuery })).resolves.toMatchObject({
        data: { statistics: { countShouts: 2 } },
        errors: undefined,
      })
    })
  })
})
