const MENTION_REGEX = /@(\S+)/g

const notify = async (resolve, root, args, context, resolveInfo) => {
  const post = await resolve(root, args, context, resolveInfo)

  const session = context.driver.session()
  const { content, id: postId } = post
  const slugs = []
  const createdAt = (new Date()).toISOString()
  let match
  while ((match = MENTION_REGEX.exec(content)) != null) {
    slugs.push(match[1])
  }
  const cypher = `
    match(u:User) where u.slug in $slugs
    match(p:Post) where p.id = $postId
    create(n:Notification{id: apoc.create.uuid(), read: false, createdAt: $createdAt})
    merge (n)-[:NOTIFIED]->(u)
    merge (p)-[:NOTIFIED]->(n)
    `
  await session.run(cypher, { slugs, createdAt, postId })
  session.close()

  return post
}

export default {
  Mutation: {
    CreatePost: notify
  }
}
