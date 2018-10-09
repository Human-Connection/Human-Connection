import trunc from 'trunc-html'

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.contentExcerpt = trunc(args.content, 120).html
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateComment: async (resolve, root, args, context, info) => {
      args.contentExcerpt = trunc(args.content, 180).html
      const result = await resolve(root, args, context, info)
      return result
    },
    CreateOrganization: async (resolve, root, args, context, info) => {
      args.descriptionExcerpt = trunc(args.description, 120).html
      const result = await resolve(root, args, context, info)
      return result
    }
  }
}
