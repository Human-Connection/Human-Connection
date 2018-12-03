import { rule, shield, allow } from 'graphql-shield'

const isOwner = rule()(async (parent, args, ctx, info) => {
  return ctx.user.id === parent.id
})

// Permissions
const permissions = shield({
  Query: {
    statistics: allow
    // fruits: and(isAuthenticated, or(isAdmin, isModerator)),
    // customers: and(isAuthenticated, isAdmin)
  },
  Mutation: {
    // addFruitToBasket: isAuthenticated
    // CreateUser: allow
  },
  User: {
    email: isOwner,
    password: isOwner
  }
  // Post: isAuthenticated
})

export default permissions
