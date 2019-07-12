import { UserInputError } from 'apollo-server'
import Joi from '@hapi/joi'

const validate = schema => {
  return async (resolve, root, args, context, info) => {
    const validation = schema.validate(args)
    if (validation.error) throw new UserInputError(validation.error)
    return resolve(root, args, context, info)
  }
}

const socialMediaSchema = Joi.object().keys({
  url: Joi.string()
    .uri()
    .required(),
})

export default {
  Mutation: {
    CreateSocialMedia: validate(socialMediaSchema),
  },
}
