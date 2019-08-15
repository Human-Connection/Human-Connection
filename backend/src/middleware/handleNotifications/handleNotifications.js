import extractMentionedUsers from './notifications/extractMentionedUsers'
import extractHashtags from './hashtags/extractHashtags'

const notifyUsers = async (label, id, idsOfUsers, context) => {
  if (!idsOfUsers.length) return

  const session = context.driver.session()
  const createdAt = new Date().toISOString()
  const cypher = `
    MATCH (source)
    WHERE source.id = $id AND $label IN LABELS(source)
    MATCH (source)<-[:WROTE]-(author: User)
    MATCH (u: User)
    WHERE u.id in $idsOfUsers
    AND NOT (u)<-[:BLOCKED]-(author)
    CREATE (n: Notification {id: apoc.create.uuid(), read: false, createdAt: $createdAt })
    MERGE (source)-[:NOTIFIED]->(n)-[:NOTIFIED]->(u)
    `
  await session.run(cypher, {
    idsOfUsers,
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
  // extract user ids before xss-middleware removes classes via the following "resolve" call
  const idsOfUsers = extractMentionedUsers(args.content)
  // extract tag (hashtag) ids before xss-middleware removes classes via the following "resolve" call
  const hashtags = extractHashtags(args.content)

  // removes classes from the content
  const post = await resolve(root, args, context, resolveInfo)

  await notifyUsers('Post', post.id, idsOfUsers, context)
  await updateHashtagsOfPost(post.id, hashtags, context)

  return post
}

const handleContentDataOfComment = async (resolve, root, args, context, resolveInfo) => {
  // extract user ids before xss-middleware removes classes via the following "resolve" call
  const idsOfUsers = extractMentionedUsers(args.content)

  // removes classes from the content
  const comment = await resolve(root, args, context, resolveInfo)

  await notifyUsers('Comment', comment.id, idsOfUsers, context)

  return comment
}

const handleCreateComment = async (resolve, root, args, context, resolveInfo) => {
  // removes classes from the content
  const comment = await handleContentDataOfComment(resolve, root, args, context, resolveInfo)

  const session = context.driver.session()
  const cypherFindUser = `
    MATCH (user: User)-[:WROTE]->(:Post)<-[:COMMENTS]-(:Comment { id: $commentId })
    RETURN user { .id }
    `
  const result = await session.run(cypherFindUser, {
    commentId: comment.id,
  })
  session.close()
  const [userWrotePost] = await result.records.map(record => {
    return record.get('user')
  })
  if (context.user.id !== userWrotePost.id) {
    await notifyUsers('Comment', comment.id, [userWrotePost.id], context)
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