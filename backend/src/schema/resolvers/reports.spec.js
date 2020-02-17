import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'
import Factory, { cleanDatabase } from '../../db/factories'
import { gql } from '../../helpers/jest'
import { getDriver, getNeode } from '../../db/neo4j'

const instance = getNeode()
const driver = getDriver()

describe('file a report on a resource', () => {
  let authenticatedUser, currentUser, mutate, query, moderator, abusiveUser, otherReportingUser
  const categoryIds = ['cat9']
  const reportMutation = gql`
    mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
      fileReport(
        resourceId: $resourceId
        reasonCategory: $reasonCategory
        reasonDescription: $reasonDescription
      ) {
        __typename
        ... on User {
          name
        }
        ... on Post {
          title
        }
        ... on Comment {
          content
        }
      }
    }
  `
  const variables = {
    resourceId: 'whatever',
    reasonCategory: 'other',
    reasonDescription: 'Violates code of conduct !!!',
  }

  beforeAll(async () => {
    await cleanDatabase()
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

  afterEach(async () => {
    await cleanDatabase()
  })

  describe('report a resource', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        await expect(mutate({ mutation: reportMutation, variables })).resolves.toMatchObject({
          data: { fileReport: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        currentUser = await Factory.build(
          'user',
          {
            id: 'current-user-id',
            role: 'user',
          },
          {
            email: 'test@example.org',
            password: '1234',
          },
        )
        otherReportingUser = await Factory.build(
          'user',
          {
            id: 'other-reporting-user-id',
            role: 'user',
          },
          {
            email: 'reporting@example.org',
            password: '1234',
          },
        )
        await Factory.build(
          'user',
          {
            id: 'abusive-user-id',
            role: 'user',
            name: 'abusive-user',
          },
          {
            email: 'abusive-user@example.org',
          },
        )
        await instance.create('Category', {
          id: 'cat9',
          name: 'Democracy & Politics',
          icon: 'university',
        })

        authenticatedUser = await currentUser.toJson()
      })

      describe('invalid resource id', () => {
        it('returns null', async () => {
          await expect(mutate({ mutation: reportMutation, variables })).resolves.toMatchObject({
            data: { fileReport: null },
            errors: undefined,
          })
        })
      })

      describe('valid resource', () => {
        describe('creates report', () => {
          it('which belongs to resource', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  __typename: 'User',
                  name: 'abusive-user',
                },
              },
              errors: undefined,
            })
          })

          it('creates only one report for multiple reports on the same resource', async () => {
            currentUser = await currentUser.toJson()
            await mutate({
              mutation: reportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })
            authenticatedUser = await otherReportingUser.toJson()
            await mutate({
              mutation: reportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })
            const firstReportId = instance.cypher(
              'MATCH (report:Report)<-[:FILED]-(user:User {id: $currentUserId}) RETURN report {.id}',
              { currentUserId: currentUser.id },
            )
            const secondReportId = instance.cypher(
              'MATCH (report:Report)<-[:FILED]-(user:User {id: $otherReportingUserId}) RETURN report {.id}',
              { otherReportingUserId: authenticatedUser.id },
            )

            expect(firstReportId).toEqual(secondReportId)
          })

          it.todo('creates multiple filed reports')
        })

        it('gives an error if the reason category is not in enum "ReasonCategory"', async () => {
          await expect(
            mutate({
              mutation: reportMutation,
              variables: {
                ...variables,
                resourceId: 'abusive-user-id',
                reasonCategory: 'category_missing_from_enum_reason_category',
              },
            }),
          ).resolves.toMatchObject({
            data: undefined,
            errors: [
              {
                message:
                  'Variable "$reasonCategory" got invalid value "category_missing_from_enum_reason_category"; Expected type ReasonCategory.',
              },
            ],
          })
        })

        it('sanitizes the reason description', async () => {
          await mutate({
            mutation: reportMutation,
            variables: {
              ...variables,
              resourceId: 'abusive-user-id',
              reasonDescription: 'My reason <sanitize></sanitize>!',
            },
          })
          const reportsQuery = await instance.cypher(
            'MATCH (resource:User {id: $resourceId})<-[:BELONGS_TO]-(report:Report)<-[filed:FILED]-(user:User {id: $currentUserId}) RETURN filed;',
            { resourceId: 'abusive-user-id', currentUserId: authenticatedUser.id },
          )
          expect(reportsQuery.records).toHaveLength(1)
          const [reportProperties] = reportsQuery.records.map(
            record => record.get('filed').properties,
          )
          expect(reportProperties).toMatchObject({ reasonDescription: 'My reason !' })
        })

        describe('reported resource is a tag', () => {
          beforeEach(async () => {
            await Factory.build('tag', {
              id: 'tag-to-report-id',
            })
          })

          it('returns null', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: {
                  ...variables,
                  resourceId: 'tag-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: { fileReport: null },
              errors: undefined,
            })
          })
        })
      })

      describe('reported resource is a post', () => {
        beforeEach(async () => {
          await Factory.build(
            'post',
            {
              id: 'post-to-report-id',
              title: 'This is a post that is going to be reported',
            },
            {
              author: currentUser,
              categoryIds,
            },
          )
        })

        it('returns post with attributes', async () => {
          await expect(
            mutate({
              mutation: reportMutation,
              variables: {
                ...variables,
                resourceId: 'post-to-report-id',
              },
            }),
          ).resolves.toMatchObject({
            data: {
              fileReport: {
                __typename: 'Post',
                title: 'This is a post that is going to be reported',
              },
            },
            errors: undefined,
          })
        })

        describe('reported resource is a comment', () => {
          beforeEach(async () => {
            await Factory.build(
              'post',
              {
                id: 'p1',
                title: 'post to comment on',
                content: 'please comment on me',
              },
              {
                categoryIds,
                author: currentUser,
              },
            )
            await Factory.build(
              'comment',
              {
                id: 'comment-to-report-id',
                content: 'Post comment to be reported.',
              },
              {
                author: currentUser,
                postId: 'p1',
              },
            )
          })

          it('returns comment with attributes', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: {
                  ...variables,
                  resourceId: 'comment-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  __typename: 'Comment',
                  content: 'Post comment to be reported.',
                },
              },
              errors: undefined,
            })
          })
        })
      })
    })
  })

  describe('query for reported resource', () => {
    const reportsQuery = gql`
      query {
        reports(orderBy: createdAt_desc) {
          id
          createdAt
          updatedAt
          closed
          resource {
            __typename
            ... on User {
              id
            }
            ... on Post {
              id
            }
            ... on Comment {
              id
            }
          }
          filed {
            submitter {
              id
            }
            createdAt
            reasonCategory
            reasonDescription
          }
        }
      }
    `

    beforeEach(async () => {
      authenticatedUser = null
      moderator = await Factory.build(
        'user',
        {
          id: 'moderator-1',
          role: 'moderator',
        },
        {
          email: 'moderator@example.org',
          password: '1234',
        },
      )
      currentUser = await Factory.build(
        'user',
        {
          id: 'current-user-id',
          role: 'user',
        },
        {
          email: 'current.user@example.org',
          password: '1234',
        },
      )
      abusiveUser = await Factory.build(
        'user',
        {
          id: 'abusive-user-1',
          role: 'user',
          name: 'abusive-user',
        },
        {
          email: 'abusive-user@example.org',
        },
      )
      await instance.create('Category', {
        id: 'cat9',
        name: 'Democracy & Politics',
        icon: 'university',
      })

      await Promise.all([
        Factory.build(
          'post',
          {
            id: 'abusive-post-1',
            content: 'Interesting Knowledge',
          },
          {
            categoryIds,
            author: abusiveUser,
          },
        ),
        Factory.build(
          'post',
          {
            id: 'post-2',
            content: 'More things to do …',
          },
          {
            author: moderator,
            categoryIds,
          },
        ),
        Factory.build(
          'post',
          {
            id: 'post-3',
            content: 'I am at school …',
          },
          {
            categoryIds,
            author: currentUser,
          },
        ),
      ])
      await Promise.all([
        Factory.build(
          'comment',
          {
            id: 'abusive-comment-1',
          },
          {
            postId: 'post-2',
            author: currentUser,
          },
        ),
      ])
      authenticatedUser = await currentUser.toJson()
      await Promise.all([
        mutate({
          mutation: reportMutation,
          variables: {
            resourceId: 'abusive-post-1',
            reasonCategory: 'other',
            reasonDescription: 'This comment is bigoted',
          },
        }),
        mutate({
          mutation: reportMutation,
          variables: {
            resourceId: 'abusive-comment-1',
            reasonCategory: 'discrimination_etc',
            reasonDescription: 'This post is bigoted',
          },
        }),
        mutate({
          mutation: reportMutation,
          variables: {
            resourceId: 'abusive-user-1',
            reasonCategory: 'doxing',
            reasonDescription: 'This user is harassing me with bigoted remarks',
          },
        }),
      ])
      authenticatedUser = null
    })

    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        authenticatedUser = null
        expect(query({ query: reportsQuery })).resolves.toMatchObject({
          data: { reports: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated', () => {
      it('role "user" gets no reports', async () => {
        authenticatedUser = await currentUser.toJson()
        expect(query({ query: reportsQuery })).resolves.toMatchObject({
          data: { reports: null },
          errors: [{ message: 'Not Authorised!' }],
        })
      })

      it('role "moderator" gets reports', async () => {
        const expected = {
          reports: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              closed: false,
              resource: {
                __typename: 'User',
                id: 'abusive-user-1',
              },
              filed: expect.arrayContaining([
                expect.objectContaining({
                  submitter: expect.objectContaining({
                    id: 'current-user-id',
                  }),
                  createdAt: expect.any(String),
                  reasonCategory: 'doxing',
                  reasonDescription: 'This user is harassing me with bigoted remarks',
                }),
              ]),
            }),
            expect.objectContaining({
              id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              closed: false,
              resource: {
                __typename: 'Post',
                id: 'abusive-post-1',
              },
              filed: expect.arrayContaining([
                expect.objectContaining({
                  submitter: expect.objectContaining({
                    id: 'current-user-id',
                  }),
                  createdAt: expect.any(String),
                  reasonCategory: 'other',
                  reasonDescription: 'This comment is bigoted',
                }),
              ]),
            }),
            expect.objectContaining({
              id: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              closed: false,
              resource: {
                __typename: 'Comment',
                id: 'abusive-comment-1',
              },
              filed: expect.arrayContaining([
                expect.objectContaining({
                  submitter: expect.objectContaining({
                    id: 'current-user-id',
                  }),
                  createdAt: expect.any(String),
                  reasonCategory: 'discrimination_etc',
                  reasonDescription: 'This post is bigoted',
                }),
              ]),
            }),
          ]),
        }
        authenticatedUser = await moderator.toJson()
        const { data } = await query({ query: reportsQuery })
        expect(data).toEqual(expected)
      })
    })
  })
})
