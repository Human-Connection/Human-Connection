import { gql } from '../../helpers/jest'
import Factory from '../../seed/factories'
import { neode as getNeode, getDriver } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()
let authenticatedUser,
  mutate,
  users,
  offensivePost,
  reportVariables,
  disableVariables,
  reportingUser,
  moderatingUser

const reportMutation = gql`
  mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
    fileReport(
      resourceId: $resourceId
      reasonCategory: $reasonCategory
      reasonDescription: $reasonDescription
    ) {
      id
    }
  }
`
const reviewMutation = gql`
  mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
    review(resourceId: $resourceId, disable: $disable, closed: $closed) {
      createdAt
      updatedAt
    }
  }
`
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

// const { query } = createTestClient(server)

beforeEach(async () => {
  users = await Promise.all([
    factory.create('User', {
      id: 'reporting-user',
    }),
    factory.create('User', {
      id: 'moderating-user',
      role: 'moderator',
    }),
  ])
  reportVariables = {
    resourceId: 'whatever',
    reasonCategory: 'other',
    reasonDescription: 'Violates code of conduct !!!',
  }
  disableVariables = {
    resourceId: 'undefined-resource',
    disable: true,
    closed: false,
  }
  reportingUser = users[0]
  moderatingUser = users[1]
  offensivePost = await factory.create('Post', {
    id: 'offensive-post',
    authorId: 'moderating-user',
  })
})

afterEach(async () => {
  await factory.cleanDatabase()
})

describe('validateReport', () => {
  it('throws an error if a user tries to report themself', async () => {
    authenticatedUser = await reportingUser.toJson()
    reportVariables = { ...reportVariables, resourceId: 'reporting-user' }
    await expect(
      mutate({ mutation: reportMutation, variables: reportVariables }),
    ).resolves.toMatchObject({
      data: { fileReport: null },
      errors: [{ message: 'You cannot report yourself!' }],
    })
  })
})

describe('validateReview', () => {
  beforeEach(async () => {
    const reportAgainstModerator = await factory.create('Report')
    await Promise.all([
      reportAgainstModerator.relateTo(reportingUser, 'filed', {
        ...reportVariables,
        resourceId: 'moderating-user',
      }),
      reportAgainstModerator.relateTo(moderatingUser, 'belongsTo'),
    ])
    authenticatedUser = await moderatingUser.toJson()
  })

  it('throws an error if a user tries to review a report against them', async () => {
    disableVariables = { ...disableVariables, resourceId: 'moderating-user' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'You cannot review yourself!' }],
    })
  })

  it('throws an error for invaild resource', async () => {
    disableVariables = { ...disableVariables, resourceId: 'non-existent-resource' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'Resource not found!' }],
    })
  })

  it('throws an error if no report exists', async () => {
    disableVariables = { ...disableVariables, resourceId: 'offensive-post' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'Before starting the review process, please report the Post!' }],
    })
  })

  it('throws an error if a moderator tries to review their own resource(Post|Comment)', async () => {
    const reportAgainstOffensivePost = await factory.create('Report')
    await Promise.all([
      reportAgainstOffensivePost.relateTo(reportingUser, 'filed', {
        ...reportVariables,
        resourceId: 'offensive-post',
      }),
      reportAgainstOffensivePost.relateTo(offensivePost, 'belongsTo'),
    ])
    disableVariables = { ...disableVariables, resourceId: 'offensive-post' }
    await expect(
      mutate({ mutation: reviewMutation, variables: disableVariables }),
    ).resolves.toMatchObject({
      data: { review: null },
      errors: [{ message: 'You cannot review your own Post!' }],
    })
  })
})
