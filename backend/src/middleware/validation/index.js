import { UserInputError } from 'apollo-server'

const USERNAME_MIN_LENGTH = 3

const validateUsername = async (resolve, root, args, context, info) => {
  if (!('name' in args) || (args.name && args.name.length >= USERNAME_MIN_LENGTH)) {
    /* eslint-disable-next-line no-return-await */
    return await resolve(root, args, context, info)
  } else {
    throw new UserInputError(`Username must be at least ${USERNAME_MIN_LENGTH} characters long!`)
  }
}

const validateUrl = async (resolve, root, args, context, info) => {
  const { url } = args
  const isValid = url.match(/^(?:https?:\/\/)(?:[^@\n])?(?:www\.)?([^:/\n?]+)/g)
  if (isValid) {
    /* eslint-disable-next-line no-return-await */
    return await resolve(root, args, context, info)
  } else {
    throw new UserInputError('Input is not a URL')
  }
}

export default {
  Mutation: {
    CreateUser: validateUsername,
    UpdateUser: validateUsername,
    CreateSocialMedia: validateUrl
  }
}
