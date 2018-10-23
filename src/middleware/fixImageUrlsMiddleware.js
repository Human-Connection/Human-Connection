
export const fixUrl = (url) => {
  return url.replace('https://api-alpha.human-connection.org', 'http://localhost:3000')
}
const fixImageURLs = (result, recursive) => {
  if (result && typeof result === 'string' && result.indexOf('https://api-alpha.human-connection.org') === 0) {
    result = fixUrl(result)
  } else if (result && Array.isArray(result)) {
    result.forEach((res, index) => {
      result[index] = fixImageURLs(result[index], true)
    })
  } else if (result && typeof result === 'object') {
    Object.keys(result).forEach(key => {
      result[key] = fixImageURLs(result[key], true)
    })
  }
  return result
}

export default {
  Mutation: async (resolve, root, args, context, info) => {
    const result = await resolve(root, args, context, info)
    return fixImageURLs(result)
  },
  Query: async (resolve, root, args, context, info) => {
    let result = await resolve(root, args, context, info)
    return fixImageURLs(result)
  }
}
