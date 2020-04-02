import extractHashtags from '../hashtags/extractHashtags'

const updateHashtagsOfPost = async (postId, hashtags, context) => {
  if (!hashtags.length) return
  const session = context.driver.session()

  try {
    await session.writeTransaction((txc) => {
      return txc.run(
        ` 
          MATCH (post:Post { id: $postId})
          OPTIONAL MATCH (post)-[previousRelations:TAGGED]->(tag:Tag)
          DELETE previousRelations
          WITH post
          UNWIND $hashtags AS tagName
          MERGE (tag:Tag {id: tagName, disabled: false, deleted: false })
          MERGE (post)-[:TAGGED]->(tag)
          RETURN post, tag
        `,
        { postId, hashtags },
      )
    })
  } finally {
    session.close()
  }
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
