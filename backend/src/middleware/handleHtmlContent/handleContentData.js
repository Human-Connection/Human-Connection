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
    postId
  })
  session.close()
}

const updateHashtagsOfPost = async (postId, hashtags, context) => {
  const session = context.driver.session()
  const cypher = `
    MATCH (p:Post { id: $postId })-[oldRelations:TAGGED]->(oldTags:Tag)
    DELETE oldRelations
    WITH p
    UNWIND $hashtags AS tagName
    MERGE (t:Tag { id: tagName, name: tagName, disabled: false, deleted: false })
    MERGE (p)-[:TAGGED]->(t)
    RETURN p, t
    `
  await session.run(cypher, {
    postId,
    hashtags
  })
  session.close()
}

const handleContentData = async (resolve, root, args, context, resolveInfo) => {
  console.log('args.content: ', args.content)
  // extract user ids before xss-middleware removes classes via the following "resolve" call
  const idsOfMentionedUsers = extractMentionedUsers(args.content)
  console.log('idsOfMentionedUsers: ', idsOfMentionedUsers)
  // extract tag (hashtag) ids before xss-middleware removes classes via the following "resolve" call
  const hashtags = extractHashtags(args.content)
  console.log('hashtags: ', hashtags)

  // removes classes from the content
  const post = await resolve(root, args, context, resolveInfo)

  console.log('post.id: ', post.id)
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