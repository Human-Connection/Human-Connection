import { createTestClient } from 'apollo-server-testing'
import createServer from '../.././server'
import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getDriver, getNeode } from '../../bootstrap/neo4j'

const factory = Factory()
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
        id
        createdAt
        updatedAt
        disable
        closed
        rule
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
  const variables = {
    resourceId: 'whatever',
    reasonCategory: 'other',
    reasonDescription: 'Violates code of conduct !!!',
  }

  beforeAll(async () => {
    await factory.cleanDatabase()
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
    await factory.cleanDatabase()
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
        currentUser = await factory.create('User', {
          id: 'current-user-id',
          role: 'user',
          email: 'test@example.org',
          password: '1234',
        })
        otherReportingUser = await factory.create('User', {
          id: 'other-reporting-user-id',
          role: 'user',
          email: 'reporting@example.org',
          password: '1234',
        })
        await factory.create('User', {
          id: 'abusive-user-id',
          role: 'user',
          name: 'abusive-user',
          email: 'abusive-user@example.org',
        })
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
                  id: expect.any(String),
                },
              },
              errors: undefined,
            })
          })

          it('creates only one report for multiple reports on the same resource', async () => {
            const firstReport = await mutate({
              mutation: reportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })
            authenticatedUser = await otherReportingUser.toJson()
            const secondReport = await mutate({
              mutation: reportMutation,
              variables: { ...variables, resourceId: 'abusive-user-id' },
            })
            expect(firstReport.data.fileReport.id).toEqual(secondReport.data.fileReport.id)
          })

          it('returns the rule for how the report was decided', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  rule: 'latestReviewUpdatedAtRules',
                },
              },
              errors: undefined,
            })
          })
          it.todo('creates multiple filed reports')
        })

        describe('reported resource is a user', () => {
          it('returns __typename "User"', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
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
                mutation: reportMutation,
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

          it('returns the submitter', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: { ...variables, resourceId: 'abusive-user-id' },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  filed: [
                    {
                      submitter: {
                        id: 'current-user-id',
                      },
                    },
                  ],
                },
              },
              errors: undefined,
            })
          })

          it('returns a date', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
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
                mutation: reportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonCategory: 'criminal_behavior_violation_german_law',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  filed: [
                    {
                      reasonCategory: 'criminal_behavior_violation_german_law',
                    },
                  ],
                },
              },
              errors: undefined,
            })
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

          it('returns the reason description', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonDescription: 'My reason!',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  filed: [
                    {
                      reasonDescription: 'My reason!',
                    },
                  ],
                },
              },
              errors: undefined,
            })
          })

          it('sanitizes the reason description', async () => {
            await expect(
              mutate({
                mutation: reportMutation,
                variables: {
                  ...variables,
                  resourceId: 'abusive-user-id',
                  reasonDescription: 'My reason <sanitize></sanitize>!',
                },
              }),
            ).resolves.toMatchObject({
              data: {
                fileReport: {
                  filed: [
                    {
                      reasonDescription: 'My reason !',
                    },
                  ],
                },
              },
              errors: undefined,
            })
          })
        })

        describe('reported resource is a post', () => {
          beforeEach(async () => {
            await factory.create('Post', {
              author: currentUser,
              id: 'post-to-report-id',
              title: 'This is a post that is going to be reported',
              categoryIds,
            })
          })

          it('returns type "Post"', async () => {
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
                mutation: reportMutation,
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
          let createPostVariables
          beforeEach(async () => {
            createPostVariables = {
              id: 'p1',
              title: 'post to comment on',
              content: 'please comment on me',
              categoryIds,
            }
            await factory.create('Post', { ...createPostVariables, author: currentUser })
            await factory.create('Comment', {
              author: currentUser,
              postId: 'p1',
              id: 'comment-to-report-id',
              content: 'Post comment to be reported.',
            })
          })

          it('returns type "Comment"', async () => {
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
                mutation: reportMutation,
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
            await factory.create('Tag', {
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
    })
  })

  describe('query for reported resource', () => {
    const reportsQuery = gql`
      query {
        reports(orderBy: createdAt_desc) {
          id
          createdAt
          updatedAt
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

    beforeEach(async () => {
      authenticatedUser = null
      moderator = await factory.create('User', {
        id: 'moderator-1',
        role: 'moderator',
        email: 'moderator@example.org',
        password: '1234',
      })
      currentUser = await factory.create('User', {
        id: 'current-user-id',
        role: 'user',
        email: 'current.user@example.org',
        password: '1234',
      })
      abusiveUser = await factory.create('User', {
        id: 'abusive-user-1',
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
          author: abusiveUser,
          id: 'abusive-post-1',
          categoryIds,
          content: 'Interesting Knowledge',
        }),
        factory.create('Post', {
          author: moderator,
          id: 'post-2',
          categoryIds,
          content: 'More things to do …',
        }),
        factory.create('Post', {
          author: currentUser,
          id: 'post-3',
          categoryIds,
          content: 'I am at school …',
        }),
      ])
      await Promise.all([
        factory.create('Comment', {
          author: currentUser,
          id: 'abusive-comment-1',
          postId: 'post-1',
        }),
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
              disable: false,
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
              disable: false,
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
              disable: false,
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
