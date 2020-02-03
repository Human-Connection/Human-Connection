// NOTE: We cannot use `fs` here to clean up the code. Cypress breaks on any npm
// module that is not browser-compatible. Node's `fs` module is server-side only
export default {
  Image: require('./Image.js').default,
  Badge: require('./Badge.js').default,
  User: require('./User.js').default,
  EmailAddress: require('./EmailAddress.js').default,
  UnverifiedEmailAddress: require('./UnverifiedEmailAddress.js').default,
  SocialMedia: require('./SocialMedia.js').default,
  Post: require('./Post.js').default,
  Comment: require('./Comment.js').default,
  Category: require('./Category.js').default,
  Tag: require('./Tag.js').default,
  Location: require('./Location.js').default,
  Donations: require('./Donations.js').default,
  Report: require('./Report.js').default,
  Migration: require('./Migration.js').default,
}
