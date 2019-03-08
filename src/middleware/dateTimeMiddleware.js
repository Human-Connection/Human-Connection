export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      args.createdAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    CreatePost: async (resolve, root, args, context, info) => {
      args.createdAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateComment: async (resolve, root, args, context, info) => {
      args.createdAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateOrganization: async (resolve, root, args, context, info) => {
      args.createdAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      args.updatedAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdatePost: async (resolve, root, args, context, info) => {
      args.updatedAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateComment: async (resolve, root, args, context, info) => {
      args.updatedAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateOrganization: async (resolve, root, args, context, info) => {
      args.updatedAt = (new Date()).toISOString()
      const result = await resolve(root, args, context, info)
      return result
    }
  }
}
