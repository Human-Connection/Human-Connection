import dotenv from 'dotenv'
import { UserInputError } from 'apollo-server'

import createOrUpdateLocations from './nodes/locations'

dotenv.config()

export default {
  Mutation: {
    CreateUser: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const USERNAME_MIN_LENGTH = 3 // TODO move to the correct place
      if (!args.name || args.name.length < USERNAME_MIN_LENGTH) {
        throw new UserInputError(`Username must be at least ${USERNAME_MIN_LENGTH} characters long!`)
      }
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    }
  }
}
