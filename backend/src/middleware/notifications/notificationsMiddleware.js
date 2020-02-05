import extractMentionedUsers from './mentions/extractMentionedUsers'
import { validateNotifyUsers } from '../validation/validationMiddleware'
import { pubsub, NOTIFICATION_ADDED } from '../../schema/resolvers/notifications'

const handleContentDataOfPost = async (resolve, root, args, context, resolveInfo) => {
  const idsOfUsers = extractMentionedUsers(args.content)
  const post = await resolve(root, args, context, resolveInfo)
  if (post && idsOfUsers && idsOfUsers.length)
    await notifyUsersOfMention('Post', post.id, idsOfUsers, 'mentioned_in_post', context)
  return post
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  const { content } = args
  let idsOfUsers = extractMentionedUsers(content)
  const comment = await resolve(root, args, context, resolveInfo)
  const [postAuthor] = await postAuthorOfComment(comment.id, { context })
  idsOfUsers = idsOfUsers.filter(id => id !== postAuthor.id)
  if (idsOfUsers && idsOfUsers.length)
    await notifyUsersOfMention('Comment', comment.id, idsOfUsers, 'mentioned_in_comment', context)
  if (context.user.id !== postAuthor.id)
    await notifyUsersOfComment('Comment', comment.id, postAuthor.id, 'commented_on_post', context)
  return comment
}

const postAuthorOfComment = async (commentId, { context }) => {
  const session = context.driver.session()
  let postAuthorId
  try {
    postAuthorId = await session.readTransaction(transaction => {
      return transaction.run(
        ` 
          MATCH (author:User)-[:WROTE]->(:Post)<-[:COMMENTS]-(:Comment { id: $commentId })
          RETURN author { .id } as authorId
        `,
        { commentId },
      )
    })
    return postAuthorId.records.map(record => record.get('authorId'))
  } finally {
    session.close()
  }
}

const notifyUsersOfMention = async (label, id, idsOfUsers, reason, context) => {
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
        WITH notification, user,
        post {.*, __typename: labels(post)[0], author: properties(author) } as finalResource
      `
      break
    }
    case 'mentioned_in_comment': {
      mentionedCypher = `
      MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(commenter: User)
      MATCH (user: User)
      WHERE user.id in $idsOfUsers
      AND NOT (user)-[:BLOCKED]-(commenter)
      AND NOT (user)-[:BLOCKED]-(postAuthor)
      MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(user)
      WITH notification, user,
      comment {.*, __typename: labels(comment)[0], author: properties(commenter), post:  post {.*, author: properties(postAuthor)} } as finalResource
      `
      break
    }
  }
  mentionedCypher += `
    WITH notification, finalResource, user
    SET notification.read = FALSE
    SET notification.createdAt = COALESCE(notification.createdAt, toString(datetime()))
    SET notification.updatedAt = toString(datetime())
    RETURN notification {.*, from: finalResource, to: properties(user)}
  `
  const session = context.driver.session()
  const writeTxResultPromise = session.writeTransaction(async transaction => {
    const notificationTransactionResponse = await transaction.run(mentionedCypher, {
      id,
      idsOfUsers,
      reason,
    })
    return notificationTransactionResponse.records.map(record => record.get('notification'))
  })
  try {
    const [notification] = await writeTxResultPromise
    return pubsub.publish(NOTIFICATION_ADDED, { notificationAdded: notification })
  } catch (error) {
    throw new Error(error)
  } finally {
    session.close()
  }
}

const notifyUsersOfComment = async (label, commentId, postAuthorId, reason, context) => {
  await validateNotifyUsers(label, reason)
  const session = context.driver.session()

  try {
    await session.writeTransaction(async transaction => {
      await transaction.run(
        `
        MATCH (postAuthor:User {id: $postAuthorId})-[:WROTE]->(post:Post)<-[:COMMENTS]-(comment:Comment { id: $commentId })<-[:WROTE]-(commenter:User)
        WHERE NOT (postAuthor)-[:BLOCKED]-(commenter)
        MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(postAuthor)
        SET notification.read = FALSE
        SET (
        CASE
        WHEN notification.createdAt IS NULL
        THEN notification END ).createdAt = toString(datetime())
        SET notification.updatedAt = toString(datetime())
      `,
        { commentId, postAuthorId, reason },
      )
    })
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
  },
}
