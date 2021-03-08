import { gql } from '../../helpers/jest'
import Factory, { cleanDatabase } from '../../db/factories'
import { createTestClient } from 'apollo-server-testing'
import { getDriver } from '../../db/neo4j'
import createServer, { pubsub } from '../../server'

let server, query, mutate, notifiedUser, authenticatedUser
let publishSpy
const driver = getDriver()
const categoryIds = ['cat9']
const createPostMutation = gql`
  mutation($id: ID, $title: String!, $postContent: String!, $categoryIds: [ID]!) {
    CreatePost(id: $id, title: $title, content: $postContent, categoryIds: $categoryIds) {
      id
      title
      content
    }
  }
`
const updatePostMutation = gql`
  mutation($id: ID!, $title: String!, $postContent: String!, $categoryIds: [ID]!) {
    UpdatePost(id: $id, content: $postContent, title: $title, categoryIds: $categoryIds) {
      title
      content
    }
  }
`
const createCommentMutation = gql`
  mutation($id: ID, $postId: ID!, $commentContent: String!) {
    CreateComment(id: $id, postId: $postId, content: $commentContent) {
      id
      content
    }
  }
`
const fileReportMutation = gql`
  mutation($resourceId: ID!, $reasonCategory: ReasonCategory!, $reasonDescription: String!) {
    fileReport(
      resourceId: $resourceId
      reasonCategory: $reasonCategory
      reasonDescription: $reasonDescription
    ) {
      reportId
    }
  }
`

beforeAll(async () => {
  await cleanDatabase()
  publishSpy = jest.spyOn(pubsub, 'publish')
  const createServerResult = createServer({
    context: () => {
      return {
        user: authenticatedUser,
        driver,
      }
    },
  })
  server = createServerResult.server
  const createTestClientResult = createTestClient(server)
  query = createTestClientResult.query
  mutate = createTestClientResult.mutate
})

beforeEach(async () => {
  publishSpy.mockClear()
  await Factory.build('category', {
    id: 'cat9',
    name: 'Democracy & Politics',
    slug: 'democracy-politics',
    icon: 'university',
  })
  notifiedUser = await Factory.build(
    'user',
    {
      id: 'you',
      name: 'Al Capone',
      slug: 'al-capone',
    },
    {
      email: 'test@example.org',
      password: '1234',
    },
  )
  authenticatedUser = await notifiedUser.toJson()
})

afterEach(async () => {
  await cleanDatabase()
})

describe('notifications', () => {
  const notificationsQuery = gql`
    query($read: Boolean) {
      notifications(read: $read, orderBy: updatedAt_desc) {
        createdAt
        read
        reason
        from {
          __typename
          ... on Post {
            id
            content
          }
          ... on Comment {
            id
            content
          }
          ... on FiledReport {
            reportId
            reasonCategory
            reasonDescription
            resource {
              __typename
              ... on User {
                id
                name
              }
              ... on Post {
                id
                content
              }
              ... on Comment {
                id
                content
              }
            }
          }
        }
      }
    }
  `

  let title
  let postContent
  let postAuthor
  const createPostAction = async () => {
    authenticatedUser = await postAuthor.toJson()
    await mutate({
      mutation: createPostMutation,
      variables: {
        id: 'p47',
        title,
        postContent,
        categoryIds,
      },
    })
    authenticatedUser = await notifiedUser.toJson()
  }

  let commentContent
  let commentAuthor
  const createCommentOnPostAction = async () => {
    await createPostAction()
    authenticatedUser = await commentAuthor.toJson()
    await mutate({
      mutation: createCommentMutation,
      variables: {
        id: 'c47',
        postId: 'p47',
        commentContent,
      },
    })
    authenticatedUser = await notifiedUser.toJson()
  }

  describe('authenticated', () => {
    beforeEach(async () => {
      authenticatedUser = await notifiedUser.toJson()
    })

    describe('given another user', () => {
      describe('comments on my post', () => {
        beforeEach(async () => {
          title = 'My post'
          postContent = 'My post content.'
          postAuthor = notifiedUser
        })

        describe('commenter is not me', () => {
          beforeEach(async () => {
            commentContent = 'Commenters comment.'
            commentAuthor = await Factory.build(
              'user',
              {
                id: 'commentAuthor',
                name: 'Mrs Comment',
                slug: 'mrs-comment',
              },
              {
                email: 'commentauthor@example.org',
                password: '1234',
              },
            )
          })

          it('sends me a notification', async () => {
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                notifications: [
                  {
                    read: false,
                    createdAt: expect.any(String),
                    reason: 'commented_on_post',
                    from: {
                      __typename: 'Comment',
                      id: 'c47',
                      content: commentContent,
                    },
                  },
                ],
              },
            })
            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          it('sends me no notification if I have blocked the comment author', async () => {
            await notifiedUser.relateTo(commentAuthor, 'blocked')
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: { notifications: [] },
            })

            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })

        describe('commenter is me', () => {
          beforeEach(async () => {
            commentContent = 'My comment.'
            commentAuthor = notifiedUser
          })

          it('sends me no notification', async () => {
            await notifiedUser.relateTo(commentAuthor, 'blocked')
            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: { notifications: [] },
            })

            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })
        })
      })

      beforeEach(async () => {
        postAuthor = await Factory.build(
          'user',
          {
            id: 'postAuthor',
            name: 'Mrs Post',
            slug: 'mrs-post',
          },
          {
            email: 'mrs-post-author@example.org',
            password: '1234',
          },
        )
      })

      describe('mentions me in a post', () => {
        beforeEach(async () => {
          title = 'Mentioning Al Capone'

          postContent =
            'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone">@al-capone</a> how do you do?'
        })

        it('sends me a notification', async () => {
          await createPostAction()
          const expectedContent =
            'Hey <a class="mention" data-mention-id="you" href="/profile/you/al-capone" target="_blank">@al-capone</a> how do you do?'
          await expect(
            query({
              query: notificationsQuery,
              variables: {
                read: false,
              },
            }),
          ).resolves.toMatchObject({
            errors: undefined,
            data: {
              notifications: [
                {
                  read: false,
                  createdAt: expect.any(String),
                  reason: 'mentioned_in_post',
                  from: {
                    __typename: 'Post',
                    id: 'p47',
                    content: expectedContent,
                  },
                },
              ],
            },
          })
        })

        it('publishes `NOTIFICATION_ADDED` to me', async () => {
          await createPostAction()
          expect(publishSpy).toHaveBeenCalledWith(
            'NOTIFICATION_ADDED',
            expect.objectContaining({
              notificationAdded: expect.objectContaining({
                reason: 'mentioned_in_post',
                to: expect.objectContaining({
                  id: 'you',
                }),
              }),
            }),
          )
          expect(publishSpy).toHaveBeenCalledTimes(1)
        })

        describe('updates the post and mentions me again', () => {
          const updatePostAction = async () => {
            const updatedContent = `
              One more mention to
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
              and again:
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
              and again
              <a data-mention-id="you" class="mention" href="/profile/you">
                @al-capone
              </a>
            `
            authenticatedUser = await postAuthor.toJson()
            await mutate({
              mutation: updatePostMutation,
              variables: {
                id: 'p47',
                title,
                postContent: updatedContent,
                categoryIds,
              },
            })
            authenticatedUser = await notifiedUser.toJson()
          }

          it('creates no duplicate notification for the same resource', async () => {
            const expectedUpdatedContent =
              '<br>One more mention to<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>and again:<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>and again<br><a data-mention-id="you" class="mention" href="/profile/you" target="_blank"><br>@al-capone<br></a><br>'
            await createPostAction()
            await updatePostAction()
            const expected = expect.objectContaining({
              data: {
                notifications: [
                  {
                    read: false,
                    createdAt: expect.any(String),
                    reason: 'mentioned_in_post',
                    from: {
                      __typename: 'Post',
                      id: 'p47',
                      content: expectedUpdatedContent,
                    },
                  },
                ],
              },
            })
            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          describe('if the notification was marked as read earlier', () => {
            const markAsReadAction = async () => {
              const mutation = gql`
                mutation($id: ID!) {
                  markAsRead(id: $id) {
                    read
                  }
                }
              `
              await mutate({ mutation, variables: { id: 'p47' } })
            }

            describe('but the next mention happens after the notification was marked as read', () => {
              it('sets the `read` attribute to false again', async () => {
                await createPostAction()
                await markAsReadAction()
                const {
                  data: {
                    notifications: [{ read: readBefore }],
                  },
                } = await query({
                  query: notificationsQuery,
                })
                await updatePostAction()
                const {
                  data: {
                    notifications: [{ read: readAfter }],
                  },
                } = await query({
                  query: notificationsQuery,
                })
                expect(readBefore).toEqual(true)
                expect(readAfter).toEqual(false)
              })

              it('does not update the `createdAt` attribute', async () => {
                await createPostAction()
                await markAsReadAction()
                const {
                  data: {
                    notifications: [{ createdAt: createdAtBefore }],
                  },
                } = await query({
                  query: notificationsQuery,
                })
                await updatePostAction()
                const {
                  data: {
                    notifications: [{ createdAt: createdAtAfter }],
                  },
                } = await query({
                  query: notificationsQuery,
                })
                expect(createdAtBefore).toBeTruthy()
                expect(Date.parse(createdAtBefore)).toEqual(expect.any(Number))
                expect(createdAtAfter).toBeTruthy()
                expect(Date.parse(createdAtAfter)).toEqual(expect.any(Number))
                expect(createdAtBefore).toEqual(createdAtAfter)
              })
            })
          })
        })

        describe('but the author of the post blocked me', () => {
          beforeEach(async () => {
            await postAuthor.relateTo(notifiedUser, 'blocked')
          })

          it('sends no notification', async () => {
            await createPostAction()
            const expected = expect.objectContaining({
              data: { notifications: [] },
            })

            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          it('does not publish `NOTIFICATION_ADDED`', async () => {
            await createPostAction()
            expect(publishSpy).not.toHaveBeenCalled()
          })
        })
      })

      describe('mentions me in a comment', () => {
        beforeEach(async () => {
          title = 'Post where I get mentioned in a comment'
          postContent = 'Content of post where I get mentioned in a comment.'
        })

        describe('I am not blocked at all', () => {
          beforeEach(async () => {
            commentContent =
              'One mention about me with <a data-mention-id="you" class="mention" href="/profile/you" target="_blank">@al-capone</a>.'
            commentAuthor = await Factory.build(
              'user',
              {
                id: 'commentAuthor',
                name: 'Mrs Comment',
                slug: 'mrs-comment',
              },
              {
                email: 'comment-author@example.org',
                password: '1234',
              },
            )
          })

          it('sends only one notification with reason mentioned_in_comment', async () => {
            postAuthor = await Factory.build(
              'user',
              {
                id: 'MrPostAuthor',
                name: 'Mr Author',
                slug: 'mr-author',
              },
              {
                email: 'mr-post-author@example.org',
                password: '1234',
              },
            )

            await createCommentOnPostAction()
            const expected = expect.objectContaining({
              data: {
                notifications: [
                  {
                    read: false,
                    createdAt: expect.any(String),
                    reason: 'mentioned_in_comment',
                    from: {
                      __typename: 'Comment',
                      id: 'c47',
                      content: commentContent,
                    },
                  },
                ],
              },
            })

            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          beforeEach(async () => {
            title = "Post where I'm the author and I get mentioned in a comment"
            postContent = 'Content of post where I get mentioned in a comment.'
            postAuthor = notifiedUser
          })

          it('sends only one notification with reason commented_on_post, no notification with reason mentioned_in_comment', async () => {
            await createCommentOnPostAction()
            const expected = {
              data: {
                notifications: [
                  {
                    read: false,
                    createdAt: expect.any(String),
                    reason: 'commented_on_post',
                    from: {
                      __typename: 'Comment',
                      id: 'c47',
                      content: commentContent,
                    },
                  },
                ],
              },
            }

            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toMatchObject(expected, { errors: undefined })
          })
        })

        describe('but the author of the post blocked me', () => {
          beforeEach(async () => {
            await postAuthor.relateTo(notifiedUser, 'blocked')
            commentContent =
              'One mention about me with <a data-mention-id="you" class="mention" href="/profile/you" target="_blank">@al-capone</a>.'
            commentAuthor = await Factory.build(
              'user',
              {
                id: 'commentAuthor',
                name: 'Mrs Comment',
                slug: 'mrs-comment',
              },
              {
                email: 'comment-author@example.org',
                password: '1234',
              },
            )
          })

          it('sends no notification', async () => {
            await createCommentOnPostAction()
            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toMatchObject({
              data: { notifications: [] },
              errors: undefined,
            })
          })

          it('does not publish `NOTIFICATION_ADDED` to authenticated user', async () => {
            await createCommentOnPostAction()
            expect(publishSpy).toHaveBeenCalledWith(
              'NOTIFICATION_ADDED',
              expect.objectContaining({
                notificationAdded: expect.objectContaining({
                  reason: 'commented_on_post',
                  to: expect.objectContaining({
                    id: 'postAuthor', // that's expected, it's not me but the post author
                  }),
                }),
              }),
            )
            expect(publishSpy).toHaveBeenCalledTimes(1)
          })
        })
      })
    })

    describe('given I file a report on a', () => {
      let resourceId, reportFiler, reportedUserOrAuthorData, expectedMeAsNotifiedForFilingReport
      const reasonCategory = 'discrimination_etc'
      const reasonDescription = 'I am free to be gay !!!'
      const fileReportAction = async () => {
        authenticatedUser = await reportFiler.toJson()
        await mutate({
          mutation: fileReportMutation,
          variables: {
            resourceId,
            reasonCategory,
            reasonDescription,
          },
        })
        authenticatedUser = await notifiedUser.toJson()
      }
      const setExpectedNotificationOfReportedResource = (resource) => {
        return expect.objectContaining({
          data: {
            notifications: [
              {
                createdAt: expect.any(String),
                read: false,
                reason: 'filed_report_on_resource',
                from: {
                  __typename: 'FiledReport',
                  reportId: expect.any(String),
                  reasonCategory: 'discrimination_etc',
                  reasonDescription: 'I am free to be gay !!!',
                  resource,
                },
              },
            ],
          },
        })
      }

      beforeEach(async () => {
        reportFiler = notifiedUser
        reportedUserOrAuthorData = {
          userProperties: {
            id: 'reportedUser',
            name: 'Mrs Badman',
            slug: 'mrs-badman',
          },
          emailProperties: {
            email: 'reported-user@example.org',
            password: '1234',
          },
        }
        expectedMeAsNotifiedForFilingReport = expect.objectContaining({
          notificationAdded: expect.objectContaining({
            reason: 'filed_report_on_resource',
            to: expect.objectContaining({
              id: 'you',
            }),
          }),
        })
      })

      describe('user', () => {
        beforeEach(async () => {
          await Factory.build(
            'user',
            reportedUserOrAuthorData.userProperties,
            reportedUserOrAuthorData.emailProperties,
          )
          resourceId = reportedUserOrAuthorData.userProperties.id
          await fileReportAction()
        })

        it('sends me a notification for filing a report on a user', async () => {
          const expected = setExpectedNotificationOfReportedResource({
            __typename: 'User',
            id: 'reportedUser',
            name: 'Mrs Badman',
          })
          const { query } = createTestClient(server)
          await expect(
            query({
              query: notificationsQuery,
              variables: {
                read: false,
              },
            }),
          ).resolves.toEqual(expected)
        })

        it('does publish `NOTIFICATION_ADDED` to authenticated user', async () => {
          expect(publishSpy).toHaveBeenCalledWith(
            'NOTIFICATION_ADDED',
            expectedMeAsNotifiedForFilingReport,
          )
        })
      })

      describe('post or comment', () => {
        beforeEach(async () => {
          title = 'My post'
          postContent = 'My post content.'
          postAuthor = await Factory.build(
            'user',
            reportedUserOrAuthorData.userProperties,
            reportedUserOrAuthorData.emailProperties,
          )
        })

        describe('post', () => {
          beforeEach(async () => {
            await createPostAction()
            resourceId = 'p47'
            await fileReportAction()
          })

          it('sends me a notification for filing a report on a post', async () => {
            const expected = setExpectedNotificationOfReportedResource({
              __typename: 'Post',
              id: 'p47',
              content: postContent,
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          it('does publish `NOTIFICATION_ADDED` to authenticated user', async () => {
            expect(publishSpy).toHaveBeenCalledWith(
              'NOTIFICATION_ADDED',
              expectedMeAsNotifiedForFilingReport,
            )
          })
        })

        describe('comment', () => {
          beforeEach(async () => {
            commentContent = "Commenter's comment."
            commentAuthor = await Factory.build(
              'user',
              {
                id: 'commentAuthor',
                name: 'Mrs Comment',
                slug: 'mrs-comment',
              },
              {
                email: 'commentauthor@example.org',
                password: '1234',
              },
            )
            await createCommentOnPostAction()
            resourceId = 'c47'
            await fileReportAction()
          })

          it('sends me a notification for filing a report on a comment', async () => {
            const expected = setExpectedNotificationOfReportedResource({
              __typename: 'Comment',
              id: 'c47',
              content: commentContent,
            })
            const { query } = createTestClient(server)
            await expect(
              query({
                query: notificationsQuery,
                variables: {
                  read: false,
                },
              }),
            ).resolves.toEqual(expected)
          })

          it('does publish `NOTIFICATION_ADDED` to authenticated user', async () => {
            expect(publishSpy).toHaveBeenCalledWith(
              'NOTIFICATION_ADDED',
              expectedMeAsNotifiedForFilingReport,
            )
          })
        })
      })
    })
  })
})
