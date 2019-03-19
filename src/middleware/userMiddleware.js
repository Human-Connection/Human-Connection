import createOrUpdateLocations from './nodes/locations'
import { generateRsaKeyPair } from '../activitypub/security'
import dotenv from 'dotenv'

dotenv.config()

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const keys = generateRsaKeyPair()
      Object.assign(args, keys)
      args.actorId = `${process.env.GRAPHQL_URI}/activitypub/users/${args.slug}`
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    }
  }
}
