import { rule, shield, allow, or } from 'graphql-shield'

/*
* TODO: implement
* See: https://github.com/Human-Connection/Nitro-Backend/pull/40#pullrequestreview-180898363
*/
const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null
})
/*
const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'ADMIN'
})
*/

const isModerator = rule()(async (parent, args, { user }, info) => {
  return user && (user.role === 'moderator' || user.role === 'admin')
})

const isMyOwn = rule({ cache: 'no_cache' })(async (parent, args, ctx, info) => {
  return ctx.user.id === parent.id
})

const onlyEnabledContent = rule({ cache: 'strict' })(async (parent, args, ctx, info) => {
  const { disabled, deleted } = args
  return !(disabled || deleted)
})

// Permissions
const permissions = shield({
  Query: {
    statistics: allow,
    currentUser: allow,
    Post: or(onlyEnabledContent, isModerator)
  },
  Mutation: {
    CreatePost: isAuthenticated,
    // TODO UpdatePost: isOwner,
    // TODO DeletePost: isOwner,
    report: isAuthenticated
  },
  User: {
    email: isMyOwn,
    password: isMyOwn
  }
})

export default permissions
