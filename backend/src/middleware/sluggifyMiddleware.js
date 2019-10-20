import uniqueSlug, { isUniqueFor } from './slugify/uniqueSlug'

export default {
  Mutation: {
    SignupVerification: async (resolve, root, args, context, info) => {
      args.slug = args.slug || (await uniqueSlug(args.name, isUniqueFor(context, 'User')))
      return resolve(root, args, context, info)
    },
    CreatePost: async (resolve, root, args, context, info) => {
      args.slug = args.slug || (await uniqueSlug(args.title, isUniqueFor(context, 'Post')))
      return resolve(root, args, context, info)
    },
    UpdatePost: async (resolve, root, args, context, info) => {
      args.slug = args.slug || (await uniqueSlug(args.title, isUniqueFor(context, 'Post')))
      return resolve(root, args, context, info)
    },
    CreateCategory: async (resolve, root, args, context, info) => {
      args.slug = args.slug || (await uniqueSlug(args.name, isUniqueFor(context, 'Category')))
      return resolve(root, args, context, info)
    },
  },
}
