import createOrUpdateLocations from './nodes/locations'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    CreatePost: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)

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
    }
  }
}
