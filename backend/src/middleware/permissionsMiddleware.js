import { rule, shield, allow, or } from 'graphql-shield'

/*
 * TODO: implement
 * See: https://github.com/Human-Connection/Nitro-Backend/pull/40#pullrequestreview-180898363
 */
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null
})

const isModerator = rule()(async (parent, args, { user }, info) => {
  return user && (user.role === 'moderator' || user.role === 'admin')
})

const isAdmin = rule()(async (parent, args, { user }, info) => {
  return user && user.role === 'admin'
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

// Permissions
const permissions = shield({
  Query: {
    Notification: isAdmin,
    statistics: allow,
    currentUser: allow,
    Post: or(onlyEnabledContent, isModerator),
  },
  Mutation: {
    UpdateNotification: belongsToMe,
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
    UpdateComment: isAuthor,
    DeleteComment: isAuthor,
    // CreateUser: allow,
  },
  User: {
    email: isMyOwn,
    password: isMyOwn,
    privateKey: isMyOwn,
  },
})

export default permissions
