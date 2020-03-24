import { UserInputError } from 'apollo-server'

const COMMENT_MIN_LENGTH = 1
const NO_POST_ERR_MESSAGE = 'Comment cannot be created without a post!'
const NO_CATEGORIES_ERR_MESSAGE =
  'You cannot save a post without at least one category or more than three'
const USERNAME_MIN_LENGTH = 3
const validateCreateComment = async (resolve, root, args, context, info) => {
  const content = args.content.replace(/<(?:.|\n)*?>/gm, '').trim()
  const { postId } = args

  if (!args.content || content.length < COMMENT_MIN_LENGTH) {
    throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
  }
  const session = context.driver.session()
  try {
    const postQueryRes = await session.readTransaction((transaction) => {
      return transaction.run(
        `
          MATCH (post:Post {id: $postId})
          RETURN post
        `,
        { postId },
      )
    })
    const [post] = postQueryRes.records.map((record) => {
      return record.get('post')
    })

    if (!post) {
      throw new UserInputError(NO_POST_ERR_MESSAGE)
    } else {
      return resolve(root, args, context, info)
    }
  } finally {
    session.close()
  }
}

const validateUpdateComment = async (resolve, root, args, context, info) => {
  const content = args.content.replace(/<(?:.|\n)*?>/gm, '').trim()
  if (!args.content || content.length < COMMENT_MIN_LENGTH) {
    throw new UserInputError(`Comment must be at least ${COMMENT_MIN_LENGTH} character long!`)
  }

  return resolve(root, args, context, info)
}

const validatePost = async (resolve, root, args, context, info) => {
  const { categoryIds } = args
  if (!Array.isArray(categoryIds) || !categoryIds.length || categoryIds.length > 3) {
    throw new UserInputError(NO_CATEGORIES_ERR_MESSAGE)
  }
  return resolve(root, args, context, info)
}

const validateUpdatePost = async (resolve, root, args, context, info) => {
  const { categoryIds } = args
  if (typeof categoryIds === 'undefined') return resolve(root, args, context, info)
  return validatePost(resolve, root, args, context, info)
}

const validateReport = async (resolve, root, args, context, info) => {
  const { resourceId } = args
  const { user } = context
  if (resourceId === user.id) throw new Error('You cannot report yourself!')
  return resolve(root, args, context, info)
}

const validateReview = async (resolve, root, args, context, info) => {
  const { resourceId } = args
  let existingReportedResource
  const { user, driver } = context
  if (resourceId === user.id) throw new Error('You cannot review yourself!')
  const session = driver.session()
  const reportReadTxPromise = session.readTransaction(async (transaction) => {
    const validateReviewTransactionResponse = await transaction.run(
      `
        MATCH (resource {id: $resourceId})
        WHERE resource:User OR resource:Post OR resource:Comment
        OPTIONAL MATCH (:User)-[filed:FILED]->(:Report {closed: false})-[:BELONGS_TO]->(resource)
        OPTIONAL MATCH (resource)<-[:WROTE]-(author:User)
        RETURN labels(resource)[0] AS label, author, filed
      `,
      {
        resourceId,
        submitterId: user.id,
      },
    )
    return validateReviewTransactionResponse.records.map((record) => ({
      label: record.get('label'),
      author: record.get('author'),
      filed: record.get('filed'),
    }))
  })
  try {
    const txResult = await reportReadTxPromise
    existingReportedResource = txResult
    if (!existingReportedResource || !existingReportedResource.length)
      throw new Error(`Resource not found or is not a Post|Comment|User!`)
    existingReportedResource = existingReportedResource[0]
    if (!existingReportedResource.filed)
      throw new Error(
        `Before starting the review process, please report the ${existingReportedResource.label}!`,
      )
    const authorId =
      existingReportedResource.label !== 'User' && existingReportedResource.author
        ? existingReportedResource.author.properties.id
        : null
    if (authorId && authorId === user.id)
      throw new Error(`You cannot review your own ${existingReportedResource.label}!`)
  } finally {
    session.close()
  }

  return resolve(root, args, context, info)
}

export const validateNotifyUsers = async (label, reason) => {
  const reasonsAllowed = ['mentioned_in_post', 'mentioned_in_comment', 'commented_on_post']
  if (!reasonsAllowed.includes(reason)) throw new Error('Notification reason is not allowed!')
  if (
    (label === 'Post' && reason !== 'mentioned_in_post') ||
    (label === 'Comment' && !['mentioned_in_comment', 'commented_on_post'].includes(reason))
  ) {
    throw new Error('Notification does not fit the reason!')
  }
}

const validateUpdateUser = async (resolve, root, params, context, info) => {
  const { name } = params
  if (typeof name === 'string' && name.trim().length < USERNAME_MIN_LENGTH)
    throw new UserInputError(`Username must be at least ${USERNAME_MIN_LENGTH} character long!`)
  return resolve(root, params, context, info)
}

export default {
  Mutation: {
    CreateComment: validateCreateComment,
    UpdateComment: validateUpdateComment,
    CreatePost: validatePost,
    UpdatePost: validateUpdatePost,
    UpdateUser: validateUpdateUser,
    fileReport: validateReport,
    review: validateReview,
  },
}
