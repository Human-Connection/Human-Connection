import extractMentionedUsers from './mentions/extractMentionedUsers'
import { validateNotifyUsers } from '../validation/validationMiddleware'

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
        AND NOT (user)<-[:BLOCKED]-(author)
        MERGE (post)-[notification:NOTIFIED {reason: $reason}]->(user)
      `
      break
    }
    case 'mentioned_in_comment': {
      mentionedCypher = `
      MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
      MATCH (user: User)
      WHERE user.id in $idsOfUsers
      AND NOT (user)<-[:BLOCKED]-(author)
      AND NOT (user)<-[:BLOCKED]-(postAuthor)
      MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(user)
      `
      break
    }
  }
  mentionedCypher += `
    SET notification.read = FALSE
    SET (
    CASE
    WHEN notification.createdAt IS NULL
    THEN notification END ).createdAt = toString(datetime())
    SET notification.updatedAt = toString(datetime())
  `
  const session = context.driver.session()
  try {
    await session.writeTransaction(transaction => {
      return transaction.run(mentionedCypher, { id, idsOfUsers, reason })
    })
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

const notifyReportFiler = async (resolve, root, args, context, resolveInfo) => {
  // const comment = await handleContentDataOfComment(resolve, root, args, context, resolveInfo)
  const report = await resolve(root, args, context, resolveInfo)

  if (report) {
    console.log('If report !!!')
    console.log('report: ', report)
    console.log('args: ', args)
    const { resourceId/* Wolle , reasonCategory, reasonDescription */ } = args
    const { driver, user } = context
    const { id: reportId } = report
    console.log('resourceId: ', resourceId)
    console.log('user.id: ', user.id)
    console.log('reportId: ', reportId)
    // Wolle await notifyUsers(report.resource.__typename, resourceId, [user.id], 'filed_report_on_resource', context)
    const session = driver.session()
    const notificationWriteTxResultPromise = session.writeTransaction(async transaction => {
      const notificationTransactionResponse = await transaction.run(
        `
          MATCH (resource {id: $resourceId})<-[:BELONGS_TO]-(:Report {id: $reportId})<-[:FILED]-(submitter:User {id: $submitterId})
          WHERE resource: User OR resource: Post OR resource: Comment
          MERGE (resource)-[notification:NOTIFIED {reason: $reason, reportId: $reportId}]->(submitter)
          ON CREATE SET notification.createdAt = toString(datetime()), notification.updatedAt = notification.createdAt
          ON MERGE SET notification.updatedAt = toString(datetime())
          SET notification.read = FALSE
        `,
        {
          reportId,
          resourceId,
          submitterId: user.id,
          reason: 'filed_report_on_resource',
          // Wolle reasonCategory,
          // Wolle reasonDescription,
        },
      )
      console.log('notificationTransactionResponse: ', notificationTransactionResponse)
      log(notificationTransactionResponse)
      // Wolle return notificationTransactionResponse.records.map(transformReturnType)
    })
    try {
      await notificationWriteTxResultPromise
      // Wolle if (!createdRelationshipWithNestedAttributes) return null
      // Wolle return createdRelationshipWithNestedAttributes
    } finally {
      session.close()
    }
  }

  return report
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateComment: handleContentDataOfComment,
    UpdateComment: handleContentDataOfComment,
    fileReport: notifyReportFiler,
  },
}
