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
  const fileReportMutation = gql`
    mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
      fileReport(
        resourceId: $resourceId
        reasonCategory: $reasonCategory
        reasonDescription: $reasonDescription
      ) {
        createdAt
        reasonCategory
        reasonDescription
        reportId
        resource {
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
    }
  `
  const variables = {
    resourceId: 'invalid',
    reasonCategory: 'other',
    reasonDescription: 'Violates code of conduct !!!',
  }
  const reportsQuery = gql`
    query($closed: Boolean) {
      reports(orderBy: createdAt_desc, closed: $closed) {
        id
        createdAt
        updatedAt
        rule
        disable
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
  const reviewMutation = gql`
    mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
      review(resourceId: $resourceId, disable: $disable, closed: $closed) {
        createdAt
        resource {
          __typename
          ... on User {
            id
            disabled
          }
          ... on Post {
            id
            disabled
          }
          ... on Comment {
            id
            disabled
          }
        }
        report {
          disable
        }
      }
    }
  `

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
        await expect(mutate({ mutation: fileReportMutation, variables })).resolves.toMatchObject({
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
        moderator = await Factory.build(
          'user',
          {
            id: 'moderator-id',
            role: 'moderator',
          },
          {
            email: 'moderator@example.org',
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
          await expect(mutate({ mutation: fileReportMutation, variables })).resolves.toMatchObject({
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
                mutation: fileReportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  reportId: expect.any(String),
                  resource: {
                    name: 'abusive-user',
                  },
                },
              },
              errors: undefined,
            })
          })

          it('only one report for multiple reports on the same resource', async () => {
            const firstReport = await mutate({
              mutation: fileReportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })
            authenticatedUser = await otherReportingUser.toJson()
            const secondReport = await mutate({
              mutation: fileReportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })

            expect(firstReport.data.fileReport.reportId).toEqual(
              secondReport.data.fileReport.reportId,
            )
          })

          describe('report properties are set correctly', () => {
            const reportsCypherQuery =
              'MATCH (resource:User {id: $resourceId})<-[:BELONGS_TO]-(report:Report {closed: false})<-[filed:FILED]-(user:User {id: $currentUserId}) RETURN report'

            it('with the rule for how the report will be decided', async () => {
              await mutate({
                mutation: fileReportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              })

              const reportsCypherQueryResponse = await instance.cypher(reportsCypherQuery, {
                resourceId: 'abusive-user-id',
                currentUserId: authenticatedUser.id,
              })
              expect(reportsCypherQueryResponse.records).toHaveLength(1)
              const [reportProperties] = reportsCypherQueryResponse.records.map(
                (record) => record.get('report').properties,
              )
              expect(reportProperties).toMatchObject({ rule: 'latestReviewUpdatedAtRules' })
            })

            describe('with overtaken disabled from resource in disable property', () => {
              it('disable is false', async () => {
                await mutate({
                  mutation: fileReportMutation,
                  variables: { ...variables, resourceId: 'abusive-user-id' },
                })

                const reportsCypherQueryResponse = await instance.cypher(reportsCypherQuery, {
                  resourceId: 'abusive-user-id',
                  currentUserId: authenticatedUser.id,
                })
                expect(reportsCypherQueryResponse.records).toHaveLength(1)
                const [reportProperties] = reportsCypherQueryResponse.records.map(
                  (record) => record.get('report').properties,
                )
                expect(reportProperties).toMatchObject({ disable: false })
              })

              it('disable is true', async () => {
                // first time filling a report to enable a moderator the disable the resource
                await mutate({
                  mutation: fileReportMutation,
                  variables: { ...variables, resourceId: 'abusive-user-id' },
                })
                authenticatedUser = await moderator.toJson()
                await mutate({
                  mutation: reviewMutation,
                  variables: {
                    resourceId: 'abusive-user-id',
                    disable: true,
                    closed: true,
                  },
                })
                authenticatedUser = await currentUser.toJson()
                // second time filling a report to see if the "disable is true" of the resource is overtaken
                await mutate({
                  mutation: fileReportMutation,
                  variables: { ...variables, resourceId: 'abusive-user-id' },
                })

                const reportsCypherQueryResponse = await instance.cypher(reportsCypherQuery, {
                  resourceId: 'abusive-user-id',
                  currentUserId: authenticatedUser.id,
                })
                expect(reportsCypherQueryResponse.records).toHaveLength(1)
                const [reportProperties] = reportsCypherQueryResponse.records.map(
                  (record) => record.get('report').properties,
                )
                expect(reportProperties).toMatchObject({ disable: true })
              })
            })
          })

          it.todo('creates multiple filed reports')
        })

        describe('reported resource is a user', () => {
          it('returns __typename "User"', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'User',
                  },
                },
              },
              errors: undefined,
            })
          })

          it('returns user attribute info', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'User',
                    name: 'abusive-user',
                  },
                },
              },
              errors: undefined,
            })
          })

          it('returns a createdAt', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  createdAt: expect.any(String),
                },
              },
              errors: undefined,
            })
          })

          it('returns the reason category', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonCategory: 'criminal_behavior_violation_german_law',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  reasonCategory: 'criminal_behavior_violation_german_law',
                },
              },
              errors: undefined,
            })
          })

          it('gives an error if the reason category is not in enum "ReasonCategory"', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
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

          it('returns the reason description', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonDescription: 'My reason!',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  reasonDescription: 'My reason!',
                },
              },
              errors: undefined,
            })
          })

          it('sanitizes the reason description', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonDescription: 'My reason <sanitize></sanitize>!',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  reasonDescription: 'My reason !',
                },
              },
              errors: undefined,
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

          it('returns type "Post"', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'post-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'Post',
                  },
                },
              },
              errors: undefined,
            })
          })

          it('returns resource in post attribute', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'post-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'Post',
                    title: 'This is a post that is going to be reported',
                  },
                },
              },
              errors: undefined,
            })
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

          it('returns type "Comment"', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'comment-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'Comment',
                  },
                },
              },
              errors: undefined,
            })
          })

          it('returns resource in comment attribute', async () => {
            await expect(
              mutate({
                mutation: fileReportMutation,
                variables: {
                  ...variables,
                  resourceId: 'comment-to-report-id',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  resource: {
                    __typename: 'Comment',
                    content: 'Post comment to be reported.',
                  },
                },
              },
              errors: undefined,
            })
          })
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
                mutation: fileReportMutation,
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
    })
  })

  describe('query for reported resource', () => {
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
          mutation: fileReportMutation,
          variables: {
            resourceId: 'abusive-post-1',
            reasonCategory: 'other',
            reasonDescription: 'This comment is bigoted',
          },
        }),
        mutate({
          mutation: fileReportMutation,
          variables: {
            resourceId: 'abusive-comment-1',
            reasonCategory: 'discrimination_etc',
            reasonDescription: 'This post is bigoted',
          },
        }),
        mutate({
          mutation: fileReportMutation,
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
