import uniqueSlug from './slugify/uniqueSlug'
import { isUniqueFor } from './slugify/assertSlug'

// Client-supplied slugs are NFC-normalized, format-checked and uniqueness-checked
// in validationMiddleware. This middleware only generates a slug when the client
// omitted one.
const generateSlugIfMissing = async (args, source, context, type, options) => {
  if (typeof args.slug === 'string' && args.slug.length > 0) return
  args.slug = await uniqueSlug(source, isUniqueFor(context, type, options))
}

export default {
  Mutation: {
    SignupVerification: async (resolve, root, args, context, info) => {
      await generateSlugIfMissing(args, args.name, context, 'User')
      return resolve(root, args, context, info)
    },
    CreatePost: async (resolve, root, args, context, info) => {
      await generateSlugIfMissing(args, args.title, context, 'Post')
      return resolve(root, args, context, info)
    },
    UpdatePost: async (resolve, root, args, context, info) => {
      await generateSlugIfMissing(args, args.title, context, 'Post', { exceptId: args.id })
      return resolve(root, args, context, info)
    },
  },
}
