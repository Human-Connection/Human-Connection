import { UserInputError } from 'apollo-server'

const USERNAME_MIN_LENGTH = 3

const validate = (...checks) => {
  return async (resolve, root, args, context, info) => {
    if (checks.every(check => check(args))) {
      /* eslint-disable-next-line no-return-await */
      return await resolve(root, args, context, info)
    }
    throw new UserInputError('Validations failed')
  }

}

const username = (args) => {
  if (!('name' in args) || (args.name && args.name.length >= USERNAME_MIN_LENGTH)) return true
  throw new UserInputError(`Username must be at least ${USERNAME_MIN_LENGTH} characters long!`)
}

const url = (args) => {
  const { url } = args
  const isValid = url.match(/^(?:https?:\/\/)(?:[^@\n])?(?:www\.)?([^:/\n?]+)/g)
  if (isValid) return true
  throw new UserInputError('Input is not a URL')
}

export default {
  Mutation: {
    CreateUser: validate(username),
    UpdateUser: validate(username),
    CreateSocialMedia: validate(url),
  },
}
