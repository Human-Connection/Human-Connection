import { rule, shield, deny, allow, or } from 'graphql-shield'

/*
 * TODO: implement
 * See: https://github.com/Human-Connection/Nitro-Backend/pull/40#pullrequestreview-180898363
 */
const isAuthenticated = rule({
  cache: 'contextual',
})(async (_parent, _args, ctx, _info) => {
  return ctx.user !== null
})

const isModerator = rule()(async (parent, args, { user }, info) => {
  return user && (user.role === 'moderator' || user.role === 'admin')
})

const isAdmin = rule()(async (parent, args, { user }, info) => {
  return user && user.role === 'admin'
})

const onlyYourself = rule({
  cache: 'no_cache',
})(async (parent, args, context, info) => {
  return context.user.id === args.id
})

const isMyOwn = rule({
  cache: 'no_cache',
})(async (parent, args, context, info) => {
  return context.user.id === parent.id
})

const belongsToMe = rule({
  cache: 'no_cache',
})(async (_, args, context) => {
  const {
    driver,
    user: { id: userId },
  } = context
  const { id: notificationId } = args
  const session = driver.session()
  const result = await session.run(
    `
  MATCH (u:User {id: $userId})<-[:NOTIFIED]-(n:Notification {id: $notificationId})
  RETURN n
  `,
    {
      userId,
      notificationId,
    },
  )
  const [notification] = result.records.map(record => {
    return record.get('n')
  })
  session.close()
  return Boolean(notification)
})

/* TODO: decide if we want to remove this check: the check
 * `onlyEnabledContent` throws authorization errors only if you have
 * arguments for `disabled` or `deleted` assuming these are filter
 * parameters. Soft-delete middleware obfuscates data on its way out
 * anyways. Furthermore, `neo4j-graphql-js` offers many ways to filter for
 * data so I believe, this is not a good check anyways.
 */
const onlyEnabledContent = rule({
  cache: 'strict',
})(async (parent, args, ctx, info) => {
  const { disabled, deleted } = args
  return !(disabled || deleted)
})

const isAuthor = rule({
  cache: 'no_cache',
})(async (parent, args, { user, driver }) => {
  if (!user) return false
  const session = driver.session()
  const { id: resourceId } = args
  const result = await session.run(
    `
  MATCH (resource {id: $resourceId})<-[:WROTE]-(author)
  RETURN author
  `,
    {
      resourceId,
    },
  )
  const [author] = result.records.map(record => {
    return record.get('author')
  })
  const {
    properties: { id: authorId },
  } = author
  session.close()
  return authorId === user.id
})

const isDeletingOwnAccount = rule({
  cache: 'no_cache',
})(async (parent, args, context, info) => {
  return context.user.id === args.id
})

// Permissions
const permissions = shield(
  {
    Query: {
      '*': deny,
      findPosts: allow,
      Category: isAdmin,
      Tag: isAdmin,
      Report: isModerator,
      Notification: isAdmin,
      statistics: allow,
      currentUser: allow,
      Post: or(onlyEnabledContent, isModerator),
      Comment: allow,
      User: allow,
      isLoggedIn: allow,
    },
    Mutation: {
      '*': deny,
      login: allow,
      UpdateNotification: belongsToMe,
      CreateUser: isAdmin,
      UpdateUser: onlyYourself,
      CreatePost: isAuthenticated,
      UpdatePost: isAuthor,
      DeletePost: isAuthor,
      report: isAuthenticated,
      CreateBadge: isAdmin,
      UpdateBadge: isAdmin,
      DeleteBadge: isAdmin,
      AddUserBadges: isAdmin,
      CreateSocialMedia: isAuthenticated,
      DeleteSocialMedia: isAuthenticated,
      // AddBadgeRewarded: isAdmin,
      // RemoveBadgeRewarded: isAdmin,
      reward: isAdmin,
      unreward: isAdmin,
      // addFruitToBasket: isAuthenticated
      follow: isAuthenticated,
      unfollow: isAuthenticated,
      shout: isAuthenticated,
      unshout: isAuthenticated,
      changePassword: isAuthenticated,
      enable: isModerator,
      disable: isModerator,
      CreateComment: isAuthenticated,
      DeleteComment: isAuthor,
      DeleteUser: isDeletingOwnAccount,
      requestPasswordReset: allow,
      resetPassword: allow,
    },
    User: {
      email: isMyOwn,
      password: isMyOwn,
      privateKey: isMyOwn,
    },
  },
  {
    fallbackRule: allow,
  },
)

export default permissions
