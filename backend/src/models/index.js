// NOTE: We cannot use `fs` here to clean up the code. Cypress breaks on any npm
// module that is not browser-compatible. Node's `fs` module is server-side only
export default {
  Badge: require('./Badge.js'),
  User: require('./User.js'),
  InvitationCode: require('./InvitationCode.js'),
  EmailAddress: require('./EmailAddress.js'),
}
