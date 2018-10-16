export default {
  Query: {
    Post: async (resolve, root, args, context, info) => {
      if (typeof args.deleted !== 'boolean') {
        args.deleted = false
      }
      const result = await resolve(root, args, context, info)
      return result
    },
    Comment: async (resolve, root, args, context, info) => {
      if (typeof args.deleted !== 'boolean') {
        args.deleted = false
      }
      const result = await resolve(root, args, context, info)
      return result
    },
    User: async (resolve, root, args, context, info) => {
      //  console.log('ROOT', root)
      // console.log('ARGS', args)
      // console.log('CONTEXT', context)
      // console.log('info', info.fieldNodes[0].arguments)
      const result = await resolve(root, args, context, info)
      return result
    }
  }
}
