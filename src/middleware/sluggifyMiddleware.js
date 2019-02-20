import uniqueSlug from './slugify/uniqueSlug'
import slug from 'slug'

const isUniqueFor = (context, type) => {
  return async (slug) => {
    const session = context.driver.session()
    const response = await session.run(
      `MATCH(p:${type} {slug: $slug }) return p.slug`, {
        slug
      })
    session.close()
    return response.records.length === 0
  }
}

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.slug = args.slug || await uniqueSlug(args.title, isUniqueFor(context, 'Post'))
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
