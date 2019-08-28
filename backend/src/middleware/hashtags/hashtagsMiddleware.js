import extractHashtags from '../hashtags/extractHashtags'

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
  const hashtags = extractHashtags(args.content)

  const post = await resolve(root, args, context, resolveInfo)

  if (post) {
    await updateHashtagsOfPost(post.id, hashtags, context)
  }

  return post
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
  },
}
