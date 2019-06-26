import { neo4jgraphql } from 'neo4j-graphql-js'
import fileUpload from './fileUpload'

export default {
  Mutation: {
    UpdatePost: async (object, params, context, resolveInfo) => {
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      return neo4jgraphql(object, params, context, resolveInfo, false)
    },

    CreatePost: async (object, params, context, resolveInfo) => {
      const { categories } = params
      params = await fileUpload(params, { file: 'imageUpload', url: 'image' })
      let post = await neo4jgraphql(object, params, context, resolveInfo, false)

      const session = context.driver.session()
      await session.run(
        'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
          'MERGE (post)<-[:WROTE]-(author) ' +
          'RETURN author',
        {
          userId: context.user.id,
          postId: post.id,
        },
      )
      if (categories && categories.length) {
        let postsCategoriesArray = []
        await Promise.all(
          categories.map(async categoryId => {
            let postsCategoriesTransaction = await session.run(
              `MATCH (category:Category { id: $categoryId}), (post:Post {id: $postId})
              MERGE (post)-[:CATEGORIZED]->(category)
              RETURN category
              `,
              {
                categoryId,
                postId: post.id,
              },
            )
            postsCategoriesArray.push(postsCategoriesTransaction)
          }),
        )
        let categoryArray = []
        postsCategoriesArray.map(categoryRecord => {
          let [category] = categoryRecord.records.map(record => {
            return {
              category: record.get('category'),
            }
          })
          categoryArray.push(category)
        })
        let categoriesPropertiesArray = []
        categoryArray.map(node => {
          let { category } = node
          let categories = { ...category.properties }
          categoriesPropertiesArray.push(categories)
        })

        post = {
          ...post,
          categories: categoriesPropertiesArray,
        }
      }
      session.close()

      return post
    },
  },
}
