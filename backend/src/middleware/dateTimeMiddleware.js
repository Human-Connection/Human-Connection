const setUpdatedAt = (resolve, root, args, context, info) => {
  args.updatedAt = new Date().toISOString()
  return resolve(root, args, context, info)
}

export default {
  Mutation: {
    UpdateUser: setUpdatedAt,
    UpdatePost: setUpdatedAt,
    UpdateComment: setUpdatedAt,
  },
}
