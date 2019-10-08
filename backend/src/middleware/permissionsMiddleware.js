import { rule, shield, deny, allow, and, or, not } from 'graphql-shield'
import { neode } from '../bootstrap/neo4j'
import CONFIG from '../config'

const debug = !!CONFIG.DEBUG
const allowExternalErrors = true

const instance = neode()

const isAuthenticated = rule({
  cache: 'contextual',
})(async (_parent, _args, ctx, _info) => {
  return !!(ctx && ctx.user && ctx.user.id)
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

const isMySocialMedia = rule({
  cache: 'no_cache',
})(async (_, args, { user }) => {
  let socialMedia = await instance.find('SocialMedia', args.id)
  socialMedia = await socialMedia.toJson()
  return socialMedia.ownedBy.node.id === user.id
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

const invitationLimitReached = rule({
  cache: 'no_cache',
})(async (parent, args, { user, driver }) => {
  const session = driver.session()
  try {
    const result = await session.run(
      `
      MATCH (user:User {id:$id})-[:GENERATED]->(i:InvitationCode)
      RETURN COUNT(i) >= 3 as limitReached
      `,
      { id: user.id },
    )
    const [limitReached] = result.records.map(record => {
      return record.get('limitReached')
    })
    return limitReached
  } finally {
    session.close()
  }
})

const isAuthor = rule({
  cache: 'no_cache',
})(async (_parent, args, { user, driver }) => {
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
  session.close()
  const [author] = result.records.map(record => {
    return record.get('author')
  })
  const authorId = author && author.properties && author.properties.id
  return authorId === user.id
})

const isDeletingOwnAccount = rule({
  cache: 'no_cache',
})(async (parent, args, context, info) => {
  return context.user.id === args.id
})

const noEmailFilter = rule({
  cache: 'no_cache',
})(async (_, args) => {
  return !('email' in args)
})

// Permissions
const permissions = shield(
  {
    Query: {
      '*': deny,
      findPosts: allow,
      embed: allow,
      Category: allow,
      Tag: allow,
      Report: isModerator,
      statistics: allow,
      currentUser: allow,
      Post: or(onlyEnabledContent, isModerator),
      Comment: allow,
      User: or(noEmailFilter, isAdmin),
      isLoggedIn: allow,
      Badge: allow,
      PostsEmotionsCountByEmotion: allow,
      PostsEmotionsByCurrentUser: isAuthenticated,
      blockedUsers: isAuthenticated,
      notifications: isAuthenticated,
    },
    Mutation: {
      '*': deny,
      login: allow,
      SignupByInvitation: allow,
      Signup: isAdmin,
      SignupVerification: allow,
      CreateInvitationCode: and(isAuthenticated, or(not(invitationLimitReached), isAdmin)),
      UpdateUser: onlyYourself,
      CreatePost: isAuthenticated,
      UpdatePost: isAuthor,
      DeletePost: isAuthor,
      report: isAuthenticated,
      CreateSocialMedia: isAuthenticated,
      UpdateSocialMedia: isMySocialMedia,
      DeleteSocialMedia: isMySocialMedia,
      // AddBadgeRewarded: isAdmin,
      // RemoveBadgeRewarded: isAdmin,
      reward: isAdmin,
      unreward: isAdmin,
      followUser: isAuthenticated,
      unfollowUser: isAuthenticated,
      shout: isAuthenticated,
      unshout: isAuthenticated,
      changePassword: isAuthenticated,
      enable: isModerator,
      disable: isModerator,
      CreateComment: isAuthenticated,
      UpdateComment: isAuthor,
      DeleteComment: isAuthor,
      DeleteUser: isDeletingOwnAccount,
      requestPasswordReset: allow,
      resetPassword: allow,
      AddPostEmotions: isAuthenticated,
      RemovePostEmotions: isAuthenticated,
      block: isAuthenticated,
      unblock: isAuthenticated,
      markAsRead: isAuthenticated,
      AddEmailAddress: isAuthenticated,
      VerifyEmailAddress: isAuthenticated,
    },
    User: {
      email: or(isMyOwn, isAdmin),
    },
  },
  {
    debug,
    allowExternalErrors,
    fallbackRule: allow,
  },
)

export default permissions
