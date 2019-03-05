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
  return user && (user.role === 'admin')
})

const isMyOwn = rule({ cache: 'no_cache' })(async (parent, args, context, info) => {
  return context.user.id === parent.id
})

const onlyEnabledContent = rule({ cache: 'strict' })(async (parent, args, ctx, info) => {
  const { disabled, deleted } = args
  return !(disabled || deleted)
})

const isAuthor = rule({ cache: 'no_cache' })(async (parent, args, { user, driver }) => {
  if (!user) return false
  const session = driver.session()
  const { id: postId } = args
  const result = await session.run(`
  MATCH (post:Post {id: $postId})<-[:WROTE]-(author)
  RETURN author
  `, { postId })
  const [author] = result.records.map((record) => {
    return record.get('author')
  })
  const { properties: { id: authorId } } = author
  session.close()
  return authorId === user.id
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
    UpdatePost: isAuthor,
    DeletePost: isAuthor,
    report: isAuthenticated,
    CreateBadge: isAdmin,
    UpdateBadge: isAdmin,
    DeleteBadge: isAdmin,

    enable: isModerator,
    disable: isModerator
    // addFruitToBasket: isAuthenticated
    // CreateUser: allow,
  },
  User: {
    email: isMyOwn,
    password: isMyOwn
  }
})

export default permissions
