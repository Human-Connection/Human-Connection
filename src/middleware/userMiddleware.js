import createOrUpdateLocations from './nodes/locations'
import find from 'lodash/find'

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

      try {
        const session = context.driver.session()
        await session.run(
          'MATCH (author:User {id: $userId}), (post:Post {id: $postId}) ' +
          'MERGE (post)<-[:WROTE]-(author) ' +
          'RETURN author', {
            userId: context.user.id,
            postId: result.id
          })
        session.close()
        // eslint-disable-next-line no-empty
      } catch (err) {}

      return result
    }
  },
  Query: {
    User: async (resolve, root, args, context, info) => {
      let isIdPresent
      let removeIdFromResult
      try {
        isIdPresent = find(info.fieldNodes[0].selectionSet.selections, item => item.name.value === 'id')
        if (!isIdPresent) {
          // add id to request as the user did not ask but we need it
          info.fieldNodes[0].selectionSet.selections.unshift({
            kind: 'Field',
            name: { kind: 'Name', value: 'id' }
          })
          removeIdFromResult = true
        }
      } catch (err) {}
      const result = await resolve(root, args, context, info)
      if (!isIdPresent && removeIdFromResult) {
        // remove id if the user did not ask for it
        info.fieldNodes[0].selectionSet.selections.shift()
      }
      return result
    }
  }
}
