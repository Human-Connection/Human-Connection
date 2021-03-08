import log from '../../schema/resolvers/helpers/databaseLogger'
import extractMentionedUsers from './mentions/extractMentionedUsers'
import { validateNotifyUsers } from '../validation/validationMiddleware'
import { pubsub, NOTIFICATION_ADDED } from '../../server'

const publishNotifications = async (...promises) => {
  const notifications = await Promise.all(promises)
  notifications
    .flat()
    .forEach((notificationAdded) => pubsub.publish(NOTIFICATION_ADDED, { notificationAdded }))
}

const debug = require('debug')('human-connection-backend:notificationsMiddleware')

const handleContentDataOfPost = async (resolve, root, args, context, resolveInfo) => {
  const idsOfUsers = extractMentionedUsers(args.content)
  const post = await resolve(root, args, context, resolveInfo)
  if (post) {
    await publishNotifications(
      notifyUsersOfMention('Post', post.id, idsOfUsers, 'mentioned_in_post', context),
    )
  }
  return post
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  const { content } = args
  let idsOfUsers = extractMentionedUsers(content)
  const comment = await resolve(root, args, context, resolveInfo)
  const [postAuthor] = await postAuthorOfComment(comment.id, { context })
  idsOfUsers = idsOfUsers.filter((id) => id !== postAuthor.id)
  await publishNotifications(
    notifyUsersOfMention('Comment', comment.id, idsOfUsers, 'mentioned_in_comment', context),
    notifyUsersOfComment('Comment', comment.id, postAuthor.id, 'commented_on_post', context),
  )
  return comment
}

const postAuthorOfComment = async (commentId, { context }) => {
  const session = context.driver.session()
  let postAuthorId
  try {
    postAuthorId = await session.readTransaction((transaction) => {
      return transaction.run(
        `
          MATCH (author:User)-[:WROTE]->(:Post)<-[:COMMENTS]-(:Comment { id: $commentId })
          RETURN author { .id } as authorId
        `,
        { commentId },
      )
    })
    return postAuthorId.records.map((record) => record.get('authorId'))
  } catch (error) {
    debug(error)
  } finally {
    session.close()
  }
}

const notifyUsersOfMention = async (label, id, idsOfUsers, reason, context) => {
  if (!(idsOfUsers && idsOfUsers.length)) return []
  await validateNotifyUsers(label, reason)
  let mentionedCypher
  switch (reason) {
    case 'mentioned_in_post': {
      mentionedCypher = `
        MATCH (post: Post { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)-[:BLOCKED]-(author)
        MERGE (post)-[notification:NOTIFIED {reason: $reason}]->(user)
        WITH post AS resource, notification, user
      `
      break
    }
    case 'mentioned_in_comment': {
      mentionedCypher = `
        MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)-[:BLOCKED]-(author)
        AND NOT (user)-[:BLOCKED]-(postAuthor)
        MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(user)
        WITH comment AS resource, notification, user
      `
      break
    }
  }
  mentionedCypher += `
    WITH notification, user, resource,
    [(resource)<-[:WROTE]-(author:User) | author {.*}] AS authors,
    [(resource)-[:COMMENTS]->(post:Post)<-[:WROTE]-(author:User) | post{.*, author: properties(author)} ] AS posts
    WITH resource, user, notification, authors, posts,
    resource {.*, __typename: labels(resource)[0], author: authors[0], post: posts[0]} AS finalResource
    SET notification.read = FALSE
    SET notification.createdAt = COALESCE(notification.createdAt, toString(datetime()))
    SET notification.updatedAt = toString(datetime())
    RETURN notification {.*, from: finalResource, to: properties(user)}
  `
  const session = context.driver.session()
  const writeTxResultPromise = session.writeTransaction(async (transaction) => {
    const notificationsTransactionResponse = await transaction.run(mentionedCypher, {
      id,
      idsOfUsers,
      reason,
    })
    log(notificationsTransactionResponse)
    return notificationsTransactionResponse.records.map((record) => record.get('notification'))
  })
  try {
    const notifications = await writeTxResultPromise
    return notifications
  } catch (error) {
    debug(error)
  } finally {
    session.close()
  }
}

const notifyUsersOfComment = async (label, commentId, postAuthorId, reason, context) => {
  if (context.user.id === postAuthorId) return []
  await validateNotifyUsers(label, reason)
  const session = context.driver.session()
  const writeTxResultPromise = await session.writeTransaction(async (transaction) => {
    const notificationsTransactionResponse = await transaction.run(
      `
      MATCH (postAuthor:User {id: $postAuthorId})-[:WROTE]->(post:Post)<-[:COMMENTS]-(comment:Comment { id: $commentId })<-[:WROTE]-(commenter:User)
      WHERE NOT (postAuthor)-[:BLOCKED]-(commenter)
      MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(postAuthor)
      SET notification.read = FALSE
      SET notification.createdAt = COALESCE(notification.createdAt, toString(datetime()))
      SET notification.updatedAt = toString(datetime())
      WITH notification, postAuthor, post,
      comment {.*, __typename: labels(comment)[0], author: properties(commenter), post:  post {.*, author: properties(postAuthor) } } AS finalResource
      RETURN notification {.*, from: finalResource, to: properties(postAuthor)}
    `,
      { commentId, postAuthorId, reason },
    )
    log(notificationsTransactionResponse)
    return notificationsTransactionResponse.records.map((record) => record.get('notification'))
  })
  try {
    const notifications = await writeTxResultPromise
    return notifications
  } catch (error) {
    debug(error)
  } finally {
    session.close()
  }
}

const handleFileReport = async (resolve, root, args, context, resolveInfo) => {
  const filedReport = await resolve(root, args, context, resolveInfo)

  if (filedReport) {
    const { reportId } = filedReport
    const { resourceId } = args
    await publishNotifications(notifyReportFiler(reportId, resourceId, context))
  }

  return filedReport
}

const notifyReportFiler = async (reportId, resourceId, context) => {
  const { driver, user } = context
  const session = driver.session()
  const writeTxResultPromise = await session.writeTransaction(async (transaction) => {
    const notificationsTransactionResponse = await transaction.run(
      `
        MATCH (resource {id: $resourceId})<-[:BELONGS_TO]-(report:Report {id: $reportId})<-[filed:FILED]-(submitter:User {id: $submitterId})
        WHERE resource: User OR resource: Post OR resource: Comment
        MERGE (report)-[notification:NOTIFIED {reason: $reason}]->(submitter)
        ON CREATE SET notification.createdAt = toString(datetime()), notification.updatedAt = notification.createdAt
        ON MATCH SET notification.updatedAt = toString(datetime())
        SET notification.read = FALSE
        WITH notification, submitter,
          {
            __typename: "FiledReport",
            reportId: report.id,
            createdAt: filed.createdAt,
            reasonCategory: filed.reasonCategory,
            reasonDescription: filed.reasonDescription,
            resource: apoc.map.merge(properties(resource), {
              __typename: labels(resource)[0]
            })
          } AS finalResource
        RETURN notification {.*, from: finalResource, to: properties(submitter)} 
      `,
      {
        reportId,
        resourceId,
        submitterId: user.id,
        reason: 'filed_report_on_resource',
      },
    )
    log(notificationsTransactionResponse)
    return notificationsTransactionResponse.records.map((record) => record.get('notification'))
  })
  try {
    const [notification] = await writeTxResultPromise
    if (notification) return [notification]
    else throw new Error(`Notification for filing a report could not be send!`)
  } catch (error) {
    debug(error)
  } finally {
    session.close()
  }
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateComment: handleContentDataOfComment,
    UpdateComment: handleContentDataOfComment,
    fileReport: handleFileReport,
  },
}
