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

const updateHashtagsOfOrganization = async (organizationId, hashtags, context) => {
  if (!hashtags.length) return
  const session = context.driver.session()

  try {
    await session.writeTransaction((txc) => {
      return txc.run(
        ` 
          MATCH (organization:Organization { id: $organizationId})
          OPTIONAL MATCH (organization)-[previousRelations:TAGGED]->(tag:Tag)
          DELETE previousRelations
          WITH organization
          UNWIND $hashtags AS tagName
          MERGE (tag:Tag {id: tagName, disabled: false, deleted: false })
          MERGE (organization)-[:TAGGED]->(tag)
          RETURN organization, tag
        `,
        { organizationId, hashtags },
      )
    })
  } finally {
    session.close()
  }
}

const handleDescriptionDataOfOrganization = async (resolve, root, args, context, resolveInfo) => {
  const hashtags = extractHashtags(args.description)

  const organization = await resolve(root, args, context, resolveInfo)

  if (organization) {
    await updateHashtagsOfOrganization(organization.id, hashtags, context)
  }

  return organization
}

export default {
  Mutation: {
    CreatePost: handleContentDataOfPost,
    UpdatePost: handleContentDataOfPost,
    CreateOrganization: handleDescriptionDataOfOrganization,
    UpdateOrganization: handleDescriptionDataOfOrganization,
  },
}
