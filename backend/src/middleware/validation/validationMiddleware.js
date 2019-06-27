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
const registrationSchema = Joi.object().keys({
  token: Joi.string().optional(),
  createdAt: Joi.string().required(),
  email: Joi.string()
    .email()
    .required(),
})

export default {
  Mutation: {
    CreateSignUp: validate(registrationSchema),
    CreateSignUpByInvitationCode: validate(registrationSchema),
    CreateUser: validate(
      Joi.object({
        name: Joi.string()
          .required()
          .min(3),
      }).unknown(),
    ),
    UpdateUser: validate(
      Joi.object({
        name: Joi.string()
          .optional()
          .min(3),
      }).unknown(),
    ),
    CreateSocialMedia: validate(socialMediaSchema),
  },
}
