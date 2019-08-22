import { UserInputError } from 'apollo-server'
import extractMentionedUsers from './notifications/extractMentionedUsers'
import extractHashtags from './hashtags/extractHashtags'

const notifyUsers = async (label, id, idsOfUsers, reason, context) => {
  if (!idsOfUsers.length) return

  // Done here, because Neode validation is not working.
  const reasonsAllowed = ['mentioned_in_post', 'mentioned_in_comment', 'comment_on_post']
  if (!reasonsAllowed.includes(reason)) {
    throw new UserInputError('Notification reason is not allowed!')
  }
  if (
    (label === 'Post' && reason !== 'mentioned_in_post') ||
    (label === 'Comment' && !['mentioned_in_comment', 'comment_on_post'].includes(reason))
  ) {
    throw new UserInputError('Notification fits not to reason!')
  }

  const session = context.driver.session()
  const createdAt = new Date().toISOString()
  let cypher
  switch (reason) {
    case 'mentioned_in_post': {
      cypher = `
        MATCH (post: Post { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)<-[:BLOCKED]-(author)
        CREATE (notification: Notification {id: apoc.create.uuid(), read: false, reason: $reason, createdAt: $createdAt })
        MERGE (post)-[:NOTIFIED]->(notification)-[:NOTIFIED]->(user)
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
        CREATE (notification: Notification {id: apoc.create.uuid(), read: false, reason: $reason, createdAt: $createdAt })
        MERGE (comment)-[:NOTIFIED]->(notification)-[:NOTIFIED]->(user)
      `
      break
    }
    case 'comment_on_post': {
      cypher = `
        MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
        MATCH (user: User)
        WHERE user.id in $idsOfUsers
        AND NOT (user)<-[:BLOCKED]-(author)
        AND NOT (author)<-[:BLOCKED]-(user)
        CREATE (notification: Notification {id: apoc.create.uuid(), read: false, reason: $reason, createdAt: $createdAt })
        MERGE (comment)-[:NOTIFIED]->(notification)-[:NOTIFIED]->(user)
      `
      break
    }
  }
  await session.run(cypher, {
    label,
    id,
    idsOfUsers,
    reason,
    createdAt,
  })
  session.close()
}

const updateHashtagsOfPost = async (postId, hashtags, context) => {
  if (!hashtags.length) return

  const session = context.driver.session()
  // We need two Cypher statements, because the 'MATCH' in the 'cypherDeletePreviousRelations' statement
  //  functions as an 'if'. In case there is no previous relation, the rest of the commands are omitted
  //  and no new Hashtags and relations will be created.
  const cypherDeletePreviousRelations = `
    MATCH (p: Post { id: $postId })-[previousRelations: TAGGED]->(t: Tag)
    DELETE previousRelations
    RETURN p, t
    `
  const cypherCreateNewTagsAndRelations = `
    MATCH (p: Post { id: $postId})
    UNWIND $hashtags AS tagName
    MERGE (t: Tag { id: tagName, disabled: false, deleted: false })
    MERGE (p)-[:TAGGED]->(t)
    RETURN p, t
    `
  await session.run(cypherDeletePreviousRelations, {
    postId,
  })
  await session.run(cypherCreateNewTagsAndRelations, {
    postId,
    hashtags,
  })
  session.close()
}

const handleContentDataOfPost = async (resolve, root, args, context, resolveInfo) => {
  const idsOfUsers = extractMentionedUsers(args.content)
  const hashtags = extractHashtags(args.content)

  const post = await resolve(root, args, context, resolveInfo)

  if (post) {
    await notifyUsers('Post', post.id, idsOfUsers, 'mentioned_in_post', context)
    await updateHashtagsOfPost(post.id, hashtags, context)
  }

  return post
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  const idsOfUsers = extractMentionedUsers(args.content)
  const comment = await resolve(root, args, context, resolveInfo)

  if (comment) {
    await notifyUsers('Comment', comment.id, idsOfUsers, 'mentioned_in_comment', context)
  }

  return comment
}

const handleCreateComment = async (resolve, root, args, context, resolveInfo) => {
  // removes classes from the content
  const comment = await handleContentDataOfComment(resolve, root, args, context, resolveInfo)

  if (comment) {
    const session = context.driver.session()
    const cypherFindUser = `
    MATCH (user: User)-[:WROTE]->(:Post)<-[:COMMENTS]-(:Comment { id: $commentId })
    RETURN user { .id }
    `
    const result = await session.run(cypherFindUser, {
      commentId: comment.id,
    })
    session.close()
    const [postAuthor] = await result.records.map(record => {
      return record.get('user')
    })
    if (context.user.id !== postAuthor.id) {
      await notifyUsers('Comment', comment.id, [postAuthor.id], 'comment_on_post', context)
    }
  }

  return comment
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateComment: handleCreateComment,
    UpdateComment: handleContentDataOfComment,
  },
}
