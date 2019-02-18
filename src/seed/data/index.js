export default {
  Badge: require('./badges.js').default,
  Category: require('./categories.js').default,
  Tags: require('./tags.js').default,

  User: require('./users.js').default,
  UserBadges: require('./users-badges.js').default,
  UserBlacklist: require('./users-blacklist.js').default,
  UserFollows: require('./users-follows.js').default,
  UserFriends: require('./users-friends.js').default,

  Organization: require('./organizations.js').default,
  Post: require('./posts.js').default,
  Comment: require('./comments.js').default,
  UserShouts: require('./users-shouts.js').default

  // Reports: require('./reports.js').default
}
