import { UserInputError } from 'apollo-server'

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
    CreateSocialMedia: validateUrl,
  },
}
