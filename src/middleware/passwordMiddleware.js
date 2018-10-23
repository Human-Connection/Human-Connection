import bcrypt from 'bcryptjs'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      args.password = await bcrypt.hashSync(args.password, 10)
      const result = await resolve(root, args, context, info)
      result.password = '*****'
      return result
    }
  },
  Query: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    if (result && result.password) {
      result.password = '*****'
    }
    return result
  }
}
