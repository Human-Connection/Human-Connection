const setCreatedAt = (resolve, root, args, context, info) => {
  args.createdAt = new Date().toISOString()
  return resolve(root, args, context, info)
}
const setUpdatedAt = (resolve, root, args, context, info) => {
  args.updatedAt = new Date().toISOString()
  return resolve(root, args, context, info)
}

export default {
  Mutation: {
    CreateInvitationCode: setCreatedAt,
    CreateSignUp: setCreatedAt,
    CreateUser: setCreatedAt,
    CreatePost: setCreatedAt,
    CreateComment: setCreatedAt,
    CreateOrganization: setCreatedAt,
    CreateNotification: setCreatedAt,
    UpdateUser: setUpdatedAt,
    UpdatePost: setUpdatedAt,
    UpdateComment: setUpdatedAt,
    UpdateOrganization: setUpdatedAt,
    UpdateNotification: setUpdatedAt,
  },
}
