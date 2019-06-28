import { neo4jgraphql } from 'neo4j-graphql-js'
import uuid from 'uuid/v4'
import fileUpload from './fileUpload'

export default {
  Mutation: {
    UpdatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },

    CreatePost: async (object, params, context, resolveInfo) => {
      const { categoryIds } = params
      delete params.categoryIds
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      params.id = params.id || uuid()
      let cypher = `CREATE (post:Post {params})
      WITH post
      MATCH (author:User {id: $userId})
      MERGE (post)<-[:WROTE]-(author)
      `
      if (categoryIds) {
        cypher += `WITH post
        UNWIND $categoryIds AS categoryId
        MATCH (category:Category {id: categoryId})
        MERGE (post)-[:CATEGORIZED]->(category)
        `
      }
      cypher += `RETURN post`
      const variables = { userId: context.user.id, categoryIds, params }

      const session = context.driver.session()
      const transactionRes = await session.run(cypher, variables)

      const [post] = transactionRes.records.map(record => {
        return record.get('post')
      })

      session.close()

      return post.properties
    },
  },
}
