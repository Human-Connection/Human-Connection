
export const fixUrl = (url) => {
  return url.replace('https://api-alpha.human-connection.org/uploads', 'http://localhost:3000/uploads')
}
const fixImageURLs = (result, resolve, root, args, context, info) => {

  if (result && typeof result === 'string' && result.indexOf('https://api-alpha.human-connection.org/uploads') === 0) {
    result = fixUrl(result)
  } else if (result && typeof result === 'object') {
    Object.keys(result).forEach(key => {
      result[key] = fixImageURLs(result[key])
    })
  }
  return result
}

export default {
  Mutation: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return fixImageURLs(result, resolve, root, args, context, info)
  },
  Query: async (resolve, root, args, context, info) => {
    let result = await resolve(root, args, context, info)

    return fixImageURLs(result, resolve, root, args, context, info)
  }
}
