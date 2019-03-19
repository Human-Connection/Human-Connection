import { generateRsaKeyPair } from '../activitypub/security'
import { activityPub } from '../activitypub/ActivityPub'

export default {
  Mutation: {
    CreatePost: async (resolve, root, args, context, info) => {
      args.activityId = activityPub.generateStatusId(context.user.slug)
      args.objectId = activityPub.generateStatusId(context.user.slug)
      return resolve(root, args, context, info)
    },
    CreateUser: async (resolve, root, args, context, info) => {
      const keys = generateRsaKeyPair()
      Object.assign(args, keys)
      args.actorId = `${process.env.GRAPHQL_URI}/activitypub/users/${args.slug}`
      return resolve(root, args, context, info)
    }
  }
}
