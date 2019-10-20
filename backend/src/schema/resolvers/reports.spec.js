import { GraphQLClient } from 'graphql-request'
import Factory from '../../seed/factories'
import { host, login, gql } from '../../jest/helpers'
import { getDriver, neode } from '../../bootstrap/neo4j'
import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'

const factory = Factory()
const instance = neode()
const driver = getDriver()

describe('report mutation', () => {
  let reportMutation
  let headers
  let client
  let variables
  let createPostVariables
  let user
  const categoryIds = ['cat9']

  const action = () => {
    reportMutation = gql`
      mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
        report(
          resourceId: $resourceId
          reasonCategory: $reasonCategory
          reasonDescription: $reasonDescription
        ) {
          createdAt
          reasonCategory
          reasonDescription
          type
          submitter {
            email
          }
          user {
            name
          }
          post {
            title
          }
          comment {
            content
          }
        }
      }
    `
    client = new GraphQLClient(host, {
      headers,
    })
    return client.request(reportMutation, variables)
  }

  beforeEach(async () => {
    variables = {
      resourceId: 'whatever',
      reasonCategory: 'other',
      reasonDescription: 'Violates code of conduct !!!',
    }
    headers = {}
    user = await factory.create('User', {
      id: 'u1',
      role: 'user',
      email: 'test@example.org',
      password: '1234',
    })
    await factory.create('User', {
      id: 'u2',
      role: 'user',
      name: 'abusive-user',
      email: 'abusive-user@example.org',
    })
    await instance.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      await expect(action()).rejects.toThrow('Not Authorised')
    })
  })

  describe('authenticated', () => {
    beforeEach(async () => {
      headers = await login({
        email: 'test@example.org',
        password: '1234',
      })
    })

    describe('invalid resource id', () => {
      it('returns null', async () => {
        await expect(action()).resolves.toEqual({
          report: null,
        })
      })
    })

    describe('valid resource id', () => {
      describe('reported resource is a user', () => {
        beforeEach(async () => {
          variables = {
            ...variables,
            resourceId: 'u2',
          }
        })

        it('returns type "User"', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              type: 'User',
            },
          })
        })

        it('returns resource in user attribute', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              user: {
                name: 'abusive-user',
              },
            },
          })
        })

        it('returns the submitter', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              submitter: {
                email: 'test@example.org',
              },
            },
          })
        })

        it('returns a date', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              createdAt: expect.any(String),
            },
          })
        })

        it('returns the reason category', async () => {
          variables = {
            ...variables,
            reasonCategory: 'criminal_behavior_violation_german_law',
          }
          await expect(action()).resolves.toMatchObject({
            report: {
              reasonCategory: 'criminal_behavior_violation_german_law',
            },
          })
        })

        it('gives an error if the reason category is not in enum "ReasonCategory"', async () => {
          variables = {
            ...variables,
            reasonCategory: 'my_category',
          }
          await expect(action()).rejects.toThrow(
            'got invalid value "my_category"; Expected type ReasonCategory',
          )
        })

        it('returns the reason description', async () => {
          variables = {
            ...variables,
            reasonDescription: 'My reason!',
          }
          await expect(action()).resolves.toMatchObject({
            report: {
              reasonDescription: 'My reason!',
            },
          })
        })

        it('sanitize the reason description', async () => {
          variables = {
            ...variables,
            reasonDescription: 'My reason <sanitize></sanitize>!',
          }
          await expect(action()).resolves.toMatchObject({
            report: {
              reasonDescription: 'My reason !',
            },
          })
        })
      })

      describe('reported resource is a post', () => {
        beforeEach(async () => {
          await factory.create('Post', {
            author: user,
            id: 'p23',
            title: 'Matt and Robert having a pair-programming',
            categoryIds,
          })
          variables = {
            ...variables,
            resourceId: 'p23',
          }
        })

        it('returns type "Post"', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              type: 'Post',
            },
          })
        })

        it('returns resource in post attribute', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              post: {
                title: 'Matt and Robert having a pair-programming',
              },
            },
          })
        })

        it('returns null in user attribute', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              user: null,
            },
          })
        })
      })

      /* An der Stelle würde ich den p23 noch mal prüfen, diesmal muss aber eine error meldung kommen.
           At this point I would check the p23 again, but this time there must be an error message. */

      describe('reported resource is a comment', () => {
        beforeEach(async () => {
          createPostVariables = {
            id: 'p1',
            title: 'post to comment on',
            content: 'please comment on me',
            categoryIds,
          }
          await factory.create('Post', { ...createPostVariables, author: user })
          await factory.create('Comment', {
            author: user,
            postId: 'p1',
            id: 'c34',
            content: 'Robert getting tired.',
          })
          variables = {
            ...variables,
            resourceId: 'c34',
          }
        })

        it('returns type "Comment"', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              type: 'Comment',
            },
          })
        })

        it('returns resource in comment attribute', async () => {
          await expect(action()).resolves.toMatchObject({
            report: {
              comment: {
                content: 'Robert getting tired.',
              },
            },
          })
        })
      })

      /* An der Stelle würde ich den c34 noch mal prüfen, diesmal muss aber eine error meldung kommen.
           At this point I would check the c34 again, but this time there must be an error message. */

      describe('reported resource is a tag', () => {
        beforeEach(async () => {
          await factory.create('Tag', {
            id: 't23',
          })
          variables = {
            ...variables,
            resourceId: 't23',
          }
        })

        it('returns null', async () => {
          await expect(action()).resolves.toMatchObject({
            report: null,
          })
        })
      })

      /* An der Stelle würde ich den t23 noch mal prüfen, diesmal muss aber eine error meldung kommen.
           At this point I would check the t23 again, but this time there must be an error message. */
    })
  })
})

describe('reports query', () => {
  let query, mutate, authenticatedUser, moderator, user, author
  const categoryIds = ['cat9']

  const reportMutation = gql`
    mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
      report(
        resourceId: $resourceId
        reasonCategory: $reasonCategory
        reasonDescription: $reasonDescription
      ) {
        type
      }
    }
  `
  const reportsQuery = gql`
    query {
      reports(orderBy: createdAt_desc) {
        createdAt
        reasonCategory
        reasonDescription
        submitter {
          id
        }
        type
        user {
          id
        }
        post {
          id
        }
        comment {
          id
        }
      }
    }
  `

  beforeAll(async () => {
    await factory.cleanDatabase()
    const { server } = createServer({
      context: () => {
        return {
          driver,
          user: authenticatedUser,
        }
      },
    })
    query = createTestClient(server).query
    mutate = createTestClient(server).mutate
  })

  beforeEach(async () => {
    authenticatedUser = null

    moderator = await factory.create('User', {
      id: 'mod1',
      role: 'moderator',
      email: 'moderator@example.org',
      password: '1234',
    })
    user = await factory.create('User', {
      id: 'user1',
      role: 'user',
      email: 'test@example.org',
      password: '1234',
    })
    author = await factory.create('User', {
      id: 'auth1',
      role: 'user',
      name: 'abusive-user',
      email: 'abusive-user@example.org',
    })
    await instance.create('Category', {
      id: 'cat9',
      name: 'Democracy & Politics',
      icon: 'university',
    })

    await Promise.all([
      factory.create('Post', {
        author,
        id: 'p1',
        categoryIds,
        content: 'Interesting Knowledge',
      }),
      factory.create('Post', {
        author: moderator,
        id: 'p2',
        categoryIds,
        content: 'More things to do …',
      }),
      factory.create('Post', {
        author: user,
        id: 'p3',
        categoryIds,
        content: 'I am at school …',
      }),
    ])
    await Promise.all([
      factory.create('Comment', {
        author: user,
        id: 'c1',
        postId: 'p1',
      }),
    ])

    authenticatedUser = await user.toJson()
    await Promise.all([
      mutate({
        mutation: reportMutation,
        variables: {
          resourceId: 'p1',
          reasonCategory: 'other',
          reasonDescription: 'This comment is bigoted',
        },
      }),
      mutate({
        mutation: reportMutation,
        variables: {
          resourceId: 'c1',
          reasonCategory: 'discrimination_etc',
          reasonDescription: 'This post is bigoted',
        },
      }),
      mutate({
        mutation: reportMutation,
        variables: {
          resourceId: 'auth1',
          reasonCategory: 'doxing',
          reasonDescription: 'This user is harassing me with bigoted remarks',
        },
      }),
    ])
    authenticatedUser = null
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('unauthenticated', () => {
    it('throws authorization error', async () => {
      authenticatedUser = null
      expect(query({ query: reportsQuery })).resolves.toMatchObject({
        data: { reports: null },
        errors: [{ message: 'Not Authorised!' }],
      })
    })

    it('role "user" gets no reports', async () => {
      authenticatedUser = await user.toJson()
      expect(query({ query: reportsQuery })).resolves.toMatchObject({
        data: { reports: null },
        errors: [{ message: 'Not Authorised!' }],
      })
    })

    it('role "moderator" gets reports', async () => {
      const expected = {
        // to check 'orderBy: createdAt_desc' is not possible here, because 'createdAt' does not differ
        reports: expect.arrayContaining([
          expect.objectContaining({
            createdAt: expect.any(String),
            reasonCategory: 'doxing',
            reasonDescription: 'This user is harassing me with bigoted remarks',
            submitter: expect.objectContaining({
              id: 'user1',
            }),
            type: 'User',
            user: expect.objectContaining({
              id: 'auth1',
            }),
            post: null,
            comment: null,
          }),
          expect.objectContaining({
            createdAt: expect.any(String),
            reasonCategory: 'other',
            reasonDescription: 'This comment is bigoted',
            submitter: expect.objectContaining({
              id: 'user1',
            }),
            type: 'Post',
            user: null,
            post: expect.objectContaining({
              id: 'p1',
            }),
            comment: null,
          }),
          expect.objectContaining({
            createdAt: expect.any(String),
            reasonCategory: 'discrimination_etc',
            reasonDescription: 'This post is bigoted',
            submitter: expect.objectContaining({
              id: 'user1',
            }),
            type: 'Comment',
            user: null,
            post: null,
            comment: expect.objectContaining({
              id: 'c1',
            }),
          }),
        ]),
      }

      authenticatedUser = await moderator.toJson()
      const { data } = await query({ query: reportsQuery })
      expect(data).toEqual(expected)
    })
  })
})
