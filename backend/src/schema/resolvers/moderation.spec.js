import { createTestClient } from 'apollo-server-testing'
import Factory from '../../seed/factories'
import { gql } from '../../helpers/jest'
import { getNeode, getDriver } from '../../bootstrap/neo4j'
import createServer from '../../server'

const factory = Factory()
const neode = getNeode()
const driver = getDriver()

let mutate,
  authenticatedUser,
  disableVariables,
  enableVariables,
  moderator,
  nonModerator,
  closeReportVariables

const reviewMutation = gql`
  mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
    review(resourceId: $resourceId, disable: $disable, closed: $closed) {
      createdAt
      updatedAt
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
        id
        createdAt
        updatedAt
        closed
        reviewed {
          createdAt
          moderator {
            id
          }
        }
      }
    }
  }
`

describe('moderate resources', () => {
  beforeAll(async () => {
    await factory.cleanDatabase()
    authenticatedUser = undefined
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

  beforeEach(async () => {
    disableVariables = {
      resourceId: 'undefined-resource',
      disable: true,
      closed: false,
    }
    enableVariables = {
      resourceId: 'undefined-resource',
      disable: false,
      closed: false,
    }
    authenticatedUser = null
    moderator = await factory.create('User', {
      id: 'moderator-id',
      name: 'Moderator',
      email: 'moderator@example.org',
      password: '1234',
      role: 'moderator',
    })
    nonModerator = await factory.create('User', {
      id: 'non-moderator',
      name: 'Non Moderator',
      email: 'non.moderator@example.org',
      password: '1234',
    })
  })

  afterEach(async () => {
    await factory.cleanDatabase()
  })

  describe('review to close report, leaving resource enabled', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        await expect(
          mutate({ mutation: reviewMutation, variables: disableVariables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await nonModerator.toJson()
      })

      it('non-moderator receives an authorization error', async () => {
        await expect(
          mutate({ mutation: reviewMutation, variables: disableVariables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('moderator', () => {
      beforeEach(async () => {
        authenticatedUser = await moderator.toJson()
        const questionablePost = await factory.create('Post', {
          id: 'should-i-be-disabled',
        })
        const reportAgainstQuestionablePost = await factory.create('Report')
        await Promise.all([
          reportAgainstQuestionablePost.relateTo(nonModerator, 'filed', {
            resourceId: 'should-i-be-disabled',
            reasonCategory: 'doxing',
            reasonDescription: "This shouldn't be shown to anybody else! It's my private thing!",
          }),
          reportAgainstQuestionablePost.relateTo(questionablePost, 'belongsTo'),
        ])
        closeReportVariables = {
          resourceId: 'should-i-be-disabled',
          disable: false,
          closed: true,
        }
      })

      it('report can be closed without disabling resource', async () => {
        await expect(
          mutate({ mutation: reviewMutation, variables: closeReportVariables }),
        ).resolves.toMatchObject({
          data: {
            review: {
              resource: { __typename: 'Post', id: 'should-i-be-disabled', disabled: false },
              report: { id: expect.any(String), closed: true },
            },
          },
          errors: undefined,
        })
      })

      it('creates only one review for multiple reviews by the same moderator on same resource', async () => {
        await Promise.all([
          mutate({
            mutation: reviewMutation,
            variables: { ...disableVariables, resourceId: 'should-i-be-disabled' },
          }),
          mutate({
            mutation: reviewMutation,
            variables: { ...enableVariables, resourceId: 'should-i-be-disabled' },
          }),
        ])
        const cypher =
          'MATCH (:Report)<-[review:REVIEWED]-(moderator:User {id: "moderator-id"}) RETURN review'
        const reviews = await neode.cypher(cypher)
        expect(reviews.records).toHaveLength(1)
      })

      it('updates the updatedAt attribute', async () => {
        const [firstReview, secondReview] = await Promise.all([
          mutate({
            mutation: reviewMutation,
            variables: { ...disableVariables, resourceId: 'should-i-be-disabled' },
          }),
          mutate({
            mutation: reviewMutation,
            variables: { ...enableVariables, resourceId: 'should-i-be-disabled' },
          }),
        ])
        expect(firstReview.data.review.updatedAt).toBeTruthy()
        expect(Date.parse(firstReview.data.review.updatedAt)).toEqual(expect.any(Number))
        expect(secondReview.data.review.updatedAt).toBeTruthy()
        expect(Date.parse(secondReview.data.review.updatedAt)).toEqual(expect.any(Number))
        expect(firstReview.data.review.updatedAt).not.toEqual(secondReview.data.review.updatedAt)
      })
    })
  })

  describe('review to disable', () => {
    describe('unauthenticated', () => {
      it('throws authorization error', async () => {
        await expect(
          mutate({ mutation: reviewMutation, variables: disableVariables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated', () => {
      beforeEach(async () => {
        authenticatedUser = await nonModerator.toJson()
      })

      it('non-moderator receives an authorization error', async () => {
        await expect(
          mutate({ mutation: reviewMutation, variables: disableVariables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('moderator', () => {
      beforeEach(async () => {
        authenticatedUser = await moderator.toJson()
      })

      describe('moderate a comment', () => {
        beforeEach(async () => {
          const trollingComment = await factory.create('Comment', {
            id: 'comment-id',
          })
          const reportAgainstTrollingComment = await factory.create('Report')
          await Promise.all([
            reportAgainstTrollingComment.relateTo(nonModerator, 'filed', {
              resourceId: 'comment-id',
              reasonCategory: 'other',
              reasonDescription: 'This comment is bigoted',
            }),
            reportAgainstTrollingComment.relateTo(trollingComment, 'belongsTo'),
          ])
          disableVariables = {
            ...disableVariables,
            resourceId: 'comment-id',
          }
        })

        it('returns disabled resource id', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: { review: { resource: { __typename: 'Comment', id: 'comment-id' } } },
            errors: undefined,
          })
        })

        it('returns .reviewed', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'Comment', id: 'comment-id' },
                report: {
                  id: expect.any(String),
                  reviewed: expect.arrayContaining([
                    { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                  ]),
                },
              },
            },
            errors: undefined,
          })
        })

        it('updates .disabled on comment', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: {
              review: { resource: { __typename: 'Comment', id: 'comment-id', disabled: true } },
            },
            errors: undefined,
          })
        })

        it('can be closed with one review', async () => {
          closeReportVariables = {
            ...disableVariables,
            closed: true,
          }
          await expect(
            mutate({ mutation: reviewMutation, variables: closeReportVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'Comment', id: 'comment-id' },
                report: { id: expect.any(String), closed: true },
              },
            },
            errors: undefined,
          })
        })
      })

      describe('moderate a post', () => {
        beforeEach(async () => {
          const trollingPost = await factory.create('Post', {
            id: 'post-id',
          })
          const reportAgainstTrollingPost = await factory.create('Report')
          await Promise.all([
            reportAgainstTrollingPost.relateTo(nonModerator, 'filed', {
              resourceId: 'post-id',
              reasonCategory: 'doxing',
              reasonDescription: "This shouldn't be shown to anybody else! It's my private thing!",
            }),
            reportAgainstTrollingPost.relateTo(trollingPost, 'belongsTo'),
          ])
          disableVariables = {
            ...disableVariables,
            resourceId: 'post-id',
          }
        })

        it('returns disabled resource id', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'Post', id: 'post-id' },
              },
            },
            errors: undefined,
          })
        })

        it('returns .reviewed', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'Post', id: 'post-id' },
                report: {
                  id: expect.any(String),
                  reviewed: expect.arrayContaining([
                    { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                  ]),
                },
              },
            },
            errors: undefined,
          })
        })

        it('updates .disabled on post', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: { review: { resource: { __typename: 'Post', id: 'post-id', disabled: true } } },
            errors: undefined,
          })
        })

        it('can be closed with one review', async () => {
          closeReportVariables = {
            ...disableVariables,
            closed: true,
          }
          await expect(
            mutate({ mutation: reviewMutation, variables: closeReportVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'Post', id: 'post-id' },
                report: { id: expect.any(String), closed: true },
              },
            },
            errors: undefined,
          })
        })
      })

      describe('moderate a user', () => {
        beforeEach(async () => {
          const troll = await factory.create('User', {
            id: 'user-id',
          })
          const reportAgainstTroll = await factory.create('Report')
          await Promise.all([
            reportAgainstTroll.relateTo(nonModerator, 'filed', {
              resourceId: 'user-id',
              reasonCategory: 'discrimination_etc',
              reasonDescription: 'This user is harassing me with bigoted remarks!',
            }),
            reportAgainstTroll.relateTo(troll, 'belongsTo'),
          ])
          disableVariables = {
            ...disableVariables,
            resourceId: 'user-id',
          }
        })

        it('returns disabled resource id', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: { review: { resource: { __typename: 'User', id: 'user-id' } } },
            errors: undefined,
          })
        })

        it('returns .reviewed', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'User', id: 'user-id' },
                report: {
                  id: expect.any(String),
                  reviewed: expect.arrayContaining([
                    { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                  ]),
                },
              },
            },
            errors: undefined,
          })
        })

        it('updates .disabled on user', async () => {
          await expect(
            mutate({ mutation: reviewMutation, variables: disableVariables }),
          ).resolves.toMatchObject({
            data: { review: { resource: { __typename: 'User', id: 'user-id', disabled: true } } },
            errors: undefined,
          })
        })

        it('can be closed with one review', async () => {
          closeReportVariables = {
            ...disableVariables,
            closed: true,
          }
          await expect(
            mutate({ mutation: reviewMutation, variables: closeReportVariables }),
          ).resolves.toMatchObject({
            data: {
              review: {
                resource: { __typename: 'User', id: 'user-id' },
                report: { id: expect.any(String), closed: true },
              },
            },
            errors: undefined,
          })
        })
      })
    })
  })

  describe('review to re-enable after disabled', () => {
    describe('unautenticated user', () => {
      it('throws authorization error', async () => {
        enableVariables = {
          ...enableVariables,
          resourceId: 'post-id',
        }
        await expect(
          mutate({ mutation: reviewMutation, variables: enableVariables }),
        ).resolves.toMatchObject({
          errors: [{ message: 'Not Authorised!' }],
        })
      })
    })

    describe('authenticated user', () => {
      describe('non moderator', () => {
        beforeEach(async () => {
          authenticatedUser = await nonModerator.toJson()
        })

        it('throws authorization error', async () => {
          enableVariables = {
            ...enableVariables,
            resourceId: 'post-id',
          }
          await expect(
            mutate({ mutation: reviewMutation, variables: enableVariables }),
          ).resolves.toMatchObject({
            errors: [{ message: 'Not Authorised!' }],
          })
        })
      })

      describe('moderator', () => {
        beforeEach(async () => {
          authenticatedUser = await moderator.toJson()
        })

        describe('moderate a comment', () => {
          beforeEach(async () => {
            const trollingComment = await factory.create('Comment', {
              id: 'comment-id',
            })
            const reportAgainstTrollingComment = await factory.create('Report')
            await Promise.all([
              reportAgainstTrollingComment.relateTo(nonModerator, 'filed', {
                resourceId: 'comment-id',
                reasonCategory: 'other',
                reasonDescription: 'This comment is bigoted',
              }),
              reportAgainstTrollingComment.relateTo(trollingComment, 'belongsTo'),
            ])
            await Promise.all([
              reportAgainstTrollingComment.relateTo(moderator, 'reviewed', {
                ...disableVariables,
                resourceId: 'comment-id',
              }),
              trollingComment.update({ disabled: true, updatedAt: new Date().toISOString() }),
            ])
            enableVariables = {
              ...enableVariables,
              resourceId: 'comment-id',
            }
          })

          it('returns enabled resource id', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: { review: { resource: { __typename: 'Comment', id: 'comment-id' } } },
            })
          })

          it('returns .reviewed', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: {
                  resource: { __typename: 'Comment', id: 'comment-id' },
                  report: {
                    id: expect.any(String),
                    reviewed: expect.arrayContaining([
                      { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                    ]),
                  },
                },
              },
            })
          })

          it('updates .disabled on comment', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: { resource: { __typename: 'Comment', id: 'comment-id', disabled: false } },
              },
            })
          })
        })

        describe('moderate a post', () => {
          beforeEach(async () => {
            const trollingPost = await factory.create('Post', {
              id: 'post-id',
            })
            const reportAgainstTrollingPost = await factory.create('Report')
            await Promise.all([
              reportAgainstTrollingPost.relateTo(nonModerator, 'filed', {
                resourceId: 'post-id',
                reasonCategory: 'doxing',
                reasonDescription:
                  "This shouldn't be shown to anybody else! It's my private thing!",
              }),
              reportAgainstTrollingPost.relateTo(trollingPost, 'belongsTo'),
            ])
            await Promise.all([
              reportAgainstTrollingPost.relateTo(moderator, 'reviewed', {
                ...disableVariables,
                resourceId: 'comment-id',
              }),
              trollingPost.update({ disabled: true, updatedAt: new Date().toISOString() }),
            ])
            enableVariables = {
              ...enableVariables,
              resourceId: 'post-id',
            }
          })

          it('returns enabled resource id', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: { review: { resource: { __typename: 'Post', id: 'post-id' } } },
            })
          })

          it('returns .reviewed', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: {
                  resource: { __typename: 'Post', id: 'post-id' },
                  report: {
                    id: expect.any(String),
                    reviewed: expect.arrayContaining([
                      { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                    ]),
                  },
                },
              },
            })
          })

          it('updates .disabled on post', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: { resource: { __typename: 'Post', id: 'post-id', disabled: false } },
              },
            })
          })
        })

        describe('moderate a user', () => {
          beforeEach(async () => {
            const troll = await factory.create('User', {
              id: 'user-id',
            })
            const reportAgainstTroll = await factory.create('Report')
            await Promise.all([
              reportAgainstTroll.relateTo(nonModerator, 'filed', {
                resourceId: 'user-id',
                reasonCategory: 'discrimination_etc',
                reasonDescription: 'This user is harassing me with bigoted remarks!',
              }),
              reportAgainstTroll.relateTo(troll, 'belongsTo'),
            ])
            await Promise.all([
              reportAgainstTroll.relateTo(moderator, 'reviewed', {
                ...disableVariables,
                resourceId: 'comment-id',
              }),
              troll.update({ disabled: true, updatedAt: new Date().toISOString() }),
            ])
            enableVariables = {
              ...enableVariables,
              resourceId: 'user-id',
            }
          })

          it('returns enabled resource id', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: { review: { resource: { __typename: 'User', id: 'user-id' } } },
            })
          })

          it('returns .reviewed', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: {
                  resource: { __typename: 'User', id: 'user-id' },
                  report: {
                    id: expect.any(String),
                    reviewed: expect.arrayContaining([
                      { createdAt: expect.any(String), moderator: { id: 'moderator-id' } },
                    ]),
                  },
                },
              },
            })
          })

          it('updates .disabled on user', async () => {
            await expect(
              mutate({ mutation: reviewMutation, variables: enableVariables }),
            ).resolves.toMatchObject({
              data: {
                review: { resource: { __typename: 'User', id: 'user-id', disabled: false } },
              },
            })
          })
        })
      })
    })
  })
})
