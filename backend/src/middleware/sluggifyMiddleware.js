import uniqueSlug, { isUniqueFor } from './slugify/uniqueSlug'

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.slug =
        args.slug ||
        (await uniqueSlug(args.title, isUniqueFor(context, 'Post')))
      return resolve(root, args, context, info)
    },
    CreateUser: async (resolve, root, args, context, info) => {
      args.slug =
        args.slug ||
        (await uniqueSlug(args.name, isUniqueFor(context, 'User')))
      return resolve(root, args, context, info)
    },
    CreateOrganization: async (resolve, root, args, context, info) => {
      args.slug =
        args.slug ||
        (await uniqueSlug(args.name, isUniqueFor(context, 'Organization')))
      return resolve(root, args, context, info)
    },
    CreateCategory: async (resolve, root, args, context, info) => {
      args.slug =
        args.slug ||
        (await uniqueSlug(args.name, isUniqueFor(context, 'Category')))
      return resolve(root, args, context, info)
    }
  }
}
