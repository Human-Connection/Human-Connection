import { rule, shield, allow } from 'graphql-shield'

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
const isModerator = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'MODERATOR'
})
*/

const isMyOwn = rule({ cache: 'no_cache' })(async (parent, args, ctx, info) => {
  return ctx.user.id === parent.id
})

// Permissions
const permissions = shield({
  Query: {
    statistics: allow,
    currentUser: allow
    // fruits: and(isAuthenticated, or(isAdmin, isModerator)),
    // customers: and(isAuthenticated, isAdmin)
  },
  Mutation: {
    CreatePost: isAuthenticated,
    // TODO UpdatePost: isOwner,
    // TODO DeletePost: isOwner,
    report: isAuthenticated,
    CreateBadge: isAuthenticated
    // addFruitToBasket: isAuthenticated
    // CreateUser: allow,
  },
  User: {
    email: isMyOwn,
    password: isMyOwn
  }
  // Post: isAuthenticated
})

export default permissions
