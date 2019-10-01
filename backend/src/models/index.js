// NOTE: We cannot use `fs` here to clean up the code. Cypress breaks on any npm
// module that is not browser-compatible. Node's `fs` module is server-side only
export default {
  Badge: require('./Badge.js'),
  User: require('./User.js'),
  InvitationCode: require('./InvitationCode.js'),
  EmailAddress: require('./EmailAddress.js'),
  UnverifiedEmailAddress: require('./UnverifiedEmailAddress.js'),
  SocialMedia: require('./SocialMedia.js'),
  Post: require('./Post.js'),
  Comment: require('./Comment.js'),
  Category: require('./Category.js'),
  Tag: require('./Tag.js'),
  Location: require('./Location.js'),
}
