import extractMentionedUsers from './mentions/extractMentionedUsers'

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

const notifyUsers = async (label, id, idsOfUsers, reason, context) => {
  if (!idsOfUsers.length) return

  // Checked here, because it does not go through GraphQL checks at all in this file.
  const reasonsAllowed = ['mentioned_in_post', 'mentioned_in_comment', 'commented_on_post']
  if (!reasonsAllowed.includes(reason)) {
    throw new Error('Notification reason is not allowed!')
  }
  if (
    (label === 'Post' && reason !== 'mentioned_in_post') ||
    (label === 'Comment' && !['mentioned_in_comment', 'commented_on_post'].includes(reason))
  ) {
    throw new Error('Notification does not fit the reason!')
  }

  let cypher
  switch (reason) {
    case 'mentioned_in_post': {
      cypher = `
        MATCH (post: Post { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)<-[:BLOCKED]-(author)
        MERGE (post)-[notification:NOTIFIED {reason: $reason}]->(user)
        SET notification.read = FALSE
        SET (
        CASE
        WHEN notification.createdAt IS NULL
        THEN notification END ).createdAt = toString(datetime())
        SET notification.updatedAt = toString(datetime())
      `
      break
    }
    case 'mentioned_in_comment': {
      cypher = `
        MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)<-[:BLOCKED]-(author)
        AND NOT (user)<-[:BLOCKED]-(postAuthor)
        MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(user)
        SET notification.read = FALSE
        SET (
        CASE
        WHEN notification.createdAt IS NULL
        THEN notification END ).createdAt = toString(datetime())
        SET notification.updatedAt = toString(datetime())
      `
      break
    }
    case 'commented_on_post': {
      cypher = `
        MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)<-[:BLOCKED]-(author)
        AND NOT (author)<-[:BLOCKED]-(user)
        MERGE (comment)-[notification:NOTIFIED {reason: $reason}]->(user)
        SET notification.read = FALSE
        SET (
        CASE
        WHEN notification.createdAt IS NULL
        THEN notification END ).createdAt = toString(datetime())
        SET notification.updatedAt = toString(datetime())
      `
      break
    }
  }
  const session = context.driver.session()
  try {
    await session.writeTransaction(transaction => {
      return transaction.run(cypher, { id, idsOfUsers, reason })
    })
  } finally {
    session.close()
  }
}

const handleContentDataOfPost = async (resolve, root, args, context, resolveInfo) => {
  const idsOfUsers = extractMentionedUsers(args.content)
  const post = await resolve(root, args, context, resolveInfo)
  if (post) return notifyUsers('Post', post.id, idsOfUsers, 'mentioned_in_post', context)
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  const { content, id: commentId } = args
  let idsOfUsers = extractMentionedUsers(content)
  const [postAuthor] = await postAuthorOfComment(commentId, { context })
  idsOfUsers = idsOfUsers.filter(id => id !== postAuthor.id)
  if (idsOfUsers && idsOfUsers.length)
    await notifyUsers('Comment', commentId, idsOfUsers, 'mentioned_in_comment', context)
  if (context.user.id !== postAuthor.id)
    await notifyUsers('Comment', commentId, [postAuthor.id], 'commented_on_post', context)
}

const handleCreateComment = async (resolve, root, args, context, resolveInfo) => {
  const comment = await resolve(root, args, context, resolveInfo)
  if (comment) return handleContentDataOfComment(resolve, root, args, context, resolveInfo)
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateComment: handleCreateComment,
    UpdateComment: handleContentDataOfComment,
  },
}
