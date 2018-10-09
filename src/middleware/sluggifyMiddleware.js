import slug from 'slug'

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.slug = slug(args.title, {
        lower: true
      })
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateUser: async (resolve, root, args, context, info) => {
      if (!args.slug) {
        args.slug = slug(args.name, {
          lower: true
        })
      }
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateOrganization: async (resolve, root, args, context, info) => {
      if (!args.slug) {
        args.slug = slug(args.name, {
          lower: true
        })
      }
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateCategory: async (resolve, root, args, context, info) => {
      if (!args.slug) {
        args.slug = slug(args.name, {
          lower: true
        })
      }
      const result = await resolve(root, args, context, info)
      return result
    }
  }
}
