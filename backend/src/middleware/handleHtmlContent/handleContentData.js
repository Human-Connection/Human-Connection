import extractMentionedUsers from './notifications/extractMentionedUsers'
import extractHashtags from './hashtags/extractHashtags'

const notifyMentions = async (label, id, idsOfMentionedUsers, context) => {
  if (!idsOfMentionedUsers.length) return

  const session = context.driver.session()
  const createdAt = new Date().toISOString()
  let cypher
  if (label === 'Post') {
    cypher = `
      MATCH (post: Post { id: $id })<-[:WROTE]-(author: User)
      MATCH (user: User)
      WHERE user.id in $idsOfMentionedUsers
      AND NOT (user)<-[:BLOCKED]-(author)
      CREATE (notification: Notification {id: apoc.create.uuid(), read: false, createdAt: $createdAt })
      MERGE (post)-[:NOTIFIED]->(notification)-[:NOTIFIED]->(user)
    `
  } else {
    cypher = `
      MATCH (postAuthor: User)-[:WROTE]->(post: Post)<-[:COMMENTS]-(comment: Comment { id: $id })<-[:WROTE]-(author: User)
      MATCH (user: User)
      WHERE user.id in $idsOfMentionedUsers
      AND NOT (user)<-[:BLOCKED]-(author)
      AND NOT (user)<-[:BLOCKED]-(postAuthor)
      CREATE (notification: Notification {id: apoc.create.uuid(), read: false, createdAt: $createdAt })
      MERGE (comment)-[:NOTIFIED]->(notification)-[:NOTIFIED]->(user)
    `
  }
  await session.run(cypher, {
    idsOfMentionedUsers,
    label,
    createdAt,
    id,
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
    MERGE (t: Tag { id: tagName, name: tagName, disabled: false, deleted: false })
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
  const idsOfMentionedUsers = extractMentionedUsers(args.content)
  const hashtags = extractHashtags(args.content)

  const post = await resolve(root, args, context, resolveInfo)

  await notifyMentions('Post', post.id, idsOfMentionedUsers, context)
  await updateHashtagsOfPost(post.id, hashtags, context)

  return post
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  const idsOfMentionedUsers = extractMentionedUsers(args.content)
  const comment = await resolve(root, args, context, resolveInfo)

  await notifyMentions('Comment', comment.id, idsOfMentionedUsers, context)

  return comment
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateComment: handleContentDataOfComment,
    UpdateComment: handleContentDataOfComment,
  },
}
