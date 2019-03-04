import { neo4jgraphql } from 'neo4j-graphql-js'

const isAuthor = async (params, { user, driver }) => {
  if (!user) return false
  const session = driver.session()
  const { id: postId } = params
  const result = await session.run(`
  MATCH (post:Post {id: $postId})<-[:WROTE]-(author)
  RETURN author
  `, { postId })
  const [author] = result.records.map((record) => {
    return record.get('author')
  })
  const { properties: { id: authorId } } = author
  session.close()
  return authorId === user.id
}

export default {
  Mutation: {
    CreatePost: async (object, params, context, resolveInfo) => {
      const result = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
        'MERGE (post)<-[:WROTE]-(author) ' +
        'RETURN author', {
          userId: context.user.id,
          postId: result.id
        })
      session.close()

      return result
    },
    UpdatePost: async (object, params, context, resolveInfo) => {
      if (!await isAuthor(params, context)) return Error('Not Authorised!')
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },
    DeletePost: async (object, params, context, resolveInfo) => {
      if (!await isAuthor(params, context)) return Error('Not Authorised!')
      return neo4jgraphql(object, params, context, resolveInfo, false)
    }
  }
}
