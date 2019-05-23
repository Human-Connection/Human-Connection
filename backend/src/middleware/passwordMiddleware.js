import bcrypt from 'bcryptjs'
import walkRecursive from '../helpers/walkRecursive'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      args.password = await bcrypt.hashSync(args.password, 10)
      const result = await resolve(root, args, context, info)
      result.password = '*****'
      return result
    },
  },
  Query: async (resolve, root, args, context, info) => {
    let result = await resolve(root, args, context, info)
    result = walkRecursive(result, ['password', 'privateKey'], () => {
      // replace password with asterisk
      return '*****'
    })
    return result
  },
}
