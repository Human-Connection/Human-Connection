import format from 'date-fns/format'

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      try {
        args.createdAt = format(new Date())
      } catch (err) {}

      args.disabled = false
      args.deleted = false
      const result = await resolve(root, args, context, info)
      return result
    },
    CreatePost: async (resolve, root, args, context, info) => {
      try {
        args.createdAt = format(new Date())
      } catch (err) {}

      args.disabled = false
      args.deleted = false
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateComment: async (resolve, root, args, context, info) => {
      try {
        args.createdAt = format(new Date())
      } catch (err) {}

      args.disabled = false
      args.deleted = false
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateOrganization: async (resolve, root, args, context, info) => {
      try {
        args.createdAt = format(new Date())
      } catch (err) {}

      args.disabled = false
      args.deleted = false
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      args.updatedAt = format(new Date())
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdatePost: async (resolve, root, args, context, info) => {
      args.updatedAt = format(new Date())
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateComment: async (resolve, root, args, context, info) => {
      args.updatedAt = format(new Date())
      const result = await resolve(root, args, context, info)
      return result
    },
    UpdateOrganization: async (resolve, root, args, context, info) => {
      args.updatedAt = format(new Date())
      const result = await resolve(root, args, context, info)
      return result
    }
  }
}
