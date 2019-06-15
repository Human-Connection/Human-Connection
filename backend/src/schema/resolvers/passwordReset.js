export default {
  Mutation: {
    requestPasswordReset: async (_, { email }, { driver }) => {
      throw Error('Not Implemented')
    },
    resetPassword: async (_, { email, token, newPassword }, { driver }) => {
      throw Error('Not Implemented')
    }
  }
}
