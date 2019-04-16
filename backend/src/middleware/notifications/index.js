import extractIds from './extractMentions'

const notify = async (resolve, root, args, context, resolveInfo) => {
  const ids = extractIds(args.content) // before mention class gets removed
  const post = await resolve(root, args, context, resolveInfo)

  const session = context.driver.session()
  const { content, id: postId } = post
  const createdAt = (new Date()).toISOString()
  const cypher = `
    match(u:User) where u.id in $ids
    match(p:Post) where p.id = $postId
    create(n:Notification{id: apoc.create.uuid(), read: false, createdAt: $createdAt})
    merge (n)-[:NOTIFIED]->(u)
    merge (p)-[:NOTIFIED]->(n)
    `
  await session.run(cypher, { ids, createdAt, postId })
  session.close()

  return post
}

export default {
  Mutation: {
    CreatePost: notify
  }
}
