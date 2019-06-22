import { UserInputError } from 'apollo-server'
import Schema from 'async-validator'

const validate = descriptor => {
  const validator = new Schema(descriptor)
  return async (resolve, root, args, context, info) => {
    try {
      await validator.validate(args)
    } catch ({ errors }) {
      throw new UserInputError(errors.map(e => e.message).join('\n'))
    }
    return resolve(root, args, context, info)
  }
}

const userSchema = { name: { type: 'string', required: true, min: 3 } }
const socialMediaSchema = { url: { type: 'url', required: true } }
const registrationSchema = { email: { type: 'email', required: true } }

export default {
  Mutation: {
    signup: validate(registrationSchema),
    invite: validate(registrationSchema),
    CreateUser: validate(userSchema),
    UpdateUser: validate(userSchema),
    CreateSocialMedia: validate(socialMediaSchema),
  },
}
