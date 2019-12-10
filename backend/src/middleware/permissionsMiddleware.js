import { rule, shield, deny, allow, or } from 'graphql-shield'
import { getNeode } from '../bootstrap/neo4j'
import CONFIG from '../config'

const debug = !!CONFIG.DEBUG
const allowExternalErrors = true

const neode = getNeode()

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
  let socialMedia = await neode.find('SocialMedia', args.id)
  socialMedia = await socialMedia.toJson()
  return socialMedia.ownedBy.node.id === user.id
})

const isAuthor = rule({
  cache: 'no_cache',
})(async (_parent, args, { user, driver }) => {
  if (!user) return false
  const { id: resourceId } = args
  const session = driver.session()
  try {
    const result = await session.run(
      `
      MATCH (resource {id: $resourceId})<-[:WROTE]-(author {id: $userId})
      RETURN author
    `,
      { resourceId, userId: user.id },
    )
    const [author] = result.records.map(record => {
      return record.get('author')
    })
    return !!author
  } finally {
    session.close()
  }
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

const publicRegistration = rule()(() => !!CONFIG.PUBLIC_REGISTRATION)

// Permissions
export default shield(
  {
    Query: {
      '*': deny,
      findPosts: allow,
      embed: allow,
      Category: allow,
      Tag: allow,
      reports: isModerator,
      statistics: allow,
      currentUser: allow,
      Post: allow,
      profilePagePosts: allow,
      Comment: allow,
      User: or(noEmailFilter, isAdmin),
      isLoggedIn: allow,
      Badge: allow,
      PostsEmotionsCountByEmotion: allow,
      PostsEmotionsByCurrentUser: isAuthenticated,
      blockedUsers: isAuthenticated,
      notifications: isAuthenticated,
      Donations: isAuthenticated,
    },
    Mutation: {
      '*': deny,
      login: allow,
      SignupByInvitation: allow,
      Signup: or(publicRegistration, isAdmin),
      SignupVerification: allow,
      UpdateUser: onlyYourself,
      CreatePost: isAuthenticated,
      UpdatePost: isAuthor,
      DeletePost: isAuthor,
      fileReport: isAuthenticated,
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
      review: isModerator,
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
      pinPost: isAdmin,
      unpinPost: isAdmin,
      UpdateDonations: isAdmin,
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
