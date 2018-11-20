import { rule, shield, and, or, not, allow } from 'graphql-shield'

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return ctx.user !== null
})
const isOwner = rule()(async (parent, args, ctx, info) => {
  return ctx.user.id === parent.id
})
const isAdmin = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'ADMIN'
})
const isModerator = rule()(async (parent, args, ctx, info) => {
  return ctx.user.role === 'MODERATOR'
})

// Permissions
const permissions = shield({
  Query: {
    statistics: isAdmin,
    // fruits: and(isAuthenticated, or(isAdmin, isModerator)),
    // customers: and(isAuthenticated, isAdmin)
  },
  Mutation: {
    // addFruitToBasket: isAuthenticated
    CreateUser: allow
  },
  // TODO: re-activate this after fixing the initial seed
  // User: {
  //   email: isOwner,
  //   password: isOwner
  // },
  Post: isAuthenticated
})

export default permissions
