export default {
  Query: {
    listCategories: async (resolve, parent, args, context, resolveInfo) => {
      console.log('Query.listCategories')
      const categories = await resolve(parent, args, context, resolveInfo)
      console.log('resolved categories:', categories)
      return categories
    },
  },
  Category: {
    slug: async (resolve, parent, args, context, resolveInfo) => {
      console.log('Category.slug')
      console.log('parent:', parent)
      const { user } = context
      if (!user) return 'censored'
      const slug = await resolve(parent, args, context, resolveInfo)
      console.log('resolved slug:', slug)
      return slug
    },
  },
}
