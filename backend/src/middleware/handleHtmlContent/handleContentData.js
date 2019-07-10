import extractMentionedUsers from './notifications/extractMentionedUsers'
import extractHashtags from './hashtags/extractHashtags'

const notify = async (postId, idsOfMentionedUsers, context) => {
  const session = context.driver.session()
  const createdAt = new Date().toISOString()
  const cypher = `
    match(u:User) where u.id in $idsOfMentionedUsers
    match(p:Post) where p.id = $postId
    create(n:Notification{id: apoc.create.uuid(), read: false, createdAt: $createdAt})
    merge (n)-[:NOTIFIED]->(u)
    merge (p)-[:NOTIFIED]->(n)
    `
  await session.run(cypher, {
    idsOfMentionedUsers,
    createdAt,
    postId,
  })
  session.close()
}

const updateHashtagsOfPost = async (postId, hashtags, context) => {
  const session = context.driver.session()
  // We need two Cypher statements, because the 'MATCH' in the 'cypherDeletePreviousRelations' statement
  //  functions as an 'if'. In case there is no previous relation, the rest of the commands are omitted
  //  and no new Hashtags and relations will be created.
  const cypherDeletePreviousRelations = `
    MATCH (p:Post { id: $postId })-[previousRelations:TAGGED]->(t:Tag)
    DELETE previousRelations
    RETURN p, t
    `
  const cypherCreateNewTagsAndRelations = `
    MATCH (p:Post { id: $postId})
    UNWIND $hashtags AS tagName
    MERGE (t:Tag { id: tagName, name: tagName, disabled: false, deleted: false })
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

const handleContentData = async (resolve, root, args, context, resolveInfo) => {
  // extract user ids before xss-middleware removes classes via the following "resolve" call
  const idsOfMentionedUsers = extractMentionedUsers(args.content)
  // extract tag (hashtag) ids before xss-middleware removes classes via the following "resolve" call
  const hashtags = extractHashtags(args.content)

  // removes classes from the content
  const post = await resolve(root, args, context, resolveInfo)

  await notify(post.id, idsOfMentionedUsers, context)
  await updateHashtagsOfPost(post.id, hashtags, context)

  return post
}

export default {
  Mutation: {
    CreatePost: handleContentData,
    UpdatePost: handleContentData,
  },
}
