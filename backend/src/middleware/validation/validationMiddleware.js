import { UserInputError } from 'apollo-server'
import Joi from '@hapi/joi'

const COMMENT_MIN_LENGTH = 1
const NO_POST_ERR_MESSAGE = 'Comment cannot be created without a post!'

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

const validateCommentCreation = async (resolve, root, args, context, info) => {
  const content = args.content.replace(/<(?:.|\n)*?>/gm, '').trim()
  const { postId } = args

  if (!args.content || content.length < COMMENT_MIN_LENGTH) {
    throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
  }
  const session = context.driver.session()
  const postQueryRes = await session.run(
    `
    MATCH (post:Post {id: $postId})
    RETURN post`,
    {
      postId,
    },
  )
  const [post] = postQueryRes.records.map(record => {
    return record.get('post')
  })

  if (!post) {
    throw new UserInputError(NO_POST_ERR_MESSAGE)
  } else {
    return resolve(root, args, context, info)
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
    CreateSocialMedia: validate(socialMediaSchema),
    CreateComment: validateCommentCreation,
    UpdateComment: validateUpdateComment,
  },
}
