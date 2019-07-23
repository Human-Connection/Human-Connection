export const undefinedToNull = list => {
  const resolvers = {}
  list.forEach(key => {
    resolvers[key] = async (parent, params, context, resolveInfo) => {
      return typeof parent[key] === 'undefined' ? null : parent[key]
    }
  })
  return resolvers
}
