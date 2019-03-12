const isModerator = ({ user }) => {
  return user && (user.role === 'moderator' || user.role === 'admin')
}

const setDefaultFilters = (resolve, root, args, context, info) => {
  if (typeof args.deleted !== 'boolean') {
    args.deleted = false
  }

  if (!isModerator(context)) {
    args.disabled = false
  }
  return resolve(root, args, context, info)
}

const hideDisabledComments = async (resolve, root, args, context, info) => {
  const { comments } = root
  if (!Array.isArray(comments)) return resolve(root, args, context, info)
  if (!isModerator(context)) {
    root.comments = comments.filter((comment) => {
      return !comment.disabled
    })
  }
  return resolve(root, args, context, info)
}

export default {
  Query: {
    Post: setDefaultFilters,
    Comment: setDefaultFilters,
    User: setDefaultFilters
  },
  Mutation: async (resolve, root, args, context, info) => {
    args.disabled = false
    // TODO: remove as soon as our factories don't need this anymore
    if (typeof args.deleted !== 'boolean') {
      args.deleted = false
    }
    return resolve(root, args, context, info)
  },
  Post: hideDisabledComments,
  User: hideDisabledComments
}
