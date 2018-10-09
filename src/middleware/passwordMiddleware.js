export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      args.password = 'TRY TO ENCRYPT IT'
      const result = await resolve(root, args, context, info)
      result.password = '*****'
      return result
    }
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    if (result.password) {
      result.password = '*****'
    }
    return result
  }
}
