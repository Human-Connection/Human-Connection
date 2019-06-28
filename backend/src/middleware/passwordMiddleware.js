import walkRecursive from '../helpers/walkRecursive'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
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
