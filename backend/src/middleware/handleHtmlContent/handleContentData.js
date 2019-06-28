import extractMentionedUsers from './notifications/extractMentionedUsers'
import extractHashtags from './hashtags/extractHashtags'

const notify = async (resolve, root, args, context, resolveInfo) => {
  // extract user ids before xss-middleware removes link classes
  const ids = extractMentionedUsers(args.content)

  console.log('ids: ', ids)

  const post = await resolve(root, args, context, resolveInfo)

  const session = context.driver.session()
  const {
    id: postId
  } = post
  const createdAt = new Date().toISOString()
  const cypher = `
    match(u:User) where u.id in $ids
    match(p:Post) where p.id = $postId
    create(n:Notification{id: apoc.create.uuid(), read: false, createdAt: $createdAt})
    merge (n)-[:NOTIFIED]->(u)
    merge (p)-[:NOTIFIED]->(n)
    `
  await session.run(cypher, {
    ids,
    createdAt,
    postId
  })
  session.close()

  return post
}

const updateHashtagsOfPost = async (postId, resolve, root, args, context, resolveInfo) => {
  // extract tag (hashtag) ids before xss-middleware removes link classes
  const hashtags = extractHashtags(args.content)

  console.log('hashtags: ', hashtags)

  // const post = await resolve(root, args, context, resolveInfo)

  const session = context.driver.session()
  // const {
  //   id: postId
  // } = post
  // const createdAt = new Date().toISOString()
  const cypher = `
    MATCH (p:Post { id: $postId })-[oldRelations: TAGGED]->(oldTags: Tag)
    DELETE oldRelations
    WITH p
    UNWIND $hashtags AS tagName
    MERGE (t: Tag { id: tagName, name: tagName })
    MERGE (p)-[:TAGGED]->(t)
    RETURN t
    `
  await session.run(cypher, {
    postId,
    hashtags
  })
  session.close()
}

const handleContentData = async (resolve, root, args, context, resolveInfo) => {
  // extract user ids before xss-middleware removes link classes

  const post = await notify(resolve, root, args, context, resolveInfo)
  await updateHashtagsOfPost(post.id, resolve, root, args, context, resolveInfo)

  return post
}

export default {
  Mutation: {
    CreatePost: handleContentData,
    UpdatePost: handleContentData,
  },
}