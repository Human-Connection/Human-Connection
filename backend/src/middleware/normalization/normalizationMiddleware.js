const normalizeEmail = (resolve, root, args, context, info) => {
  const { email } = args
  if (email) args.email = email.toLowerCase()
  return resolve(root, args, context, info)
}

export default {
  Mutation: {
    CreateSignUp: normalizeEmail,
    CreateSignUpByInvitationCode: normalizeEmail,
    CreateUser: normalizeEmail,
    UpdateUser: normalizeEmail,
  },
}
