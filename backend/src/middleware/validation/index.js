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

const validateUpdateComment = async (resolve, root, args, context, info) => {
  const COMMENT_MIN_LENGTH = 1
  const content = args.content.replace(/<(?:.|\n)*?>/gm, '').trim()
  if (!args.content || content.length < COMMENT_MIN_LENGTH) {
    throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
  }

  return resolve(root, args, context, info)
}

export default {
  Mutation: {
    CreateSocialMedia: validateUrl,
    UpdateComment: validateUpdateComment,
  },
}
