const legacyUrls = [
  'https://api-alpha.human-connection.org',
  'https://staging-api.human-connection.org',
  'http://localhost:3000',
]

export const fixUrl = url => {
  legacyUrls.forEach(legacyUrl => {
    url = url.replace(legacyUrl, '/api')
  })
  return url
}

const checkUrl = thing => {
  return (
    thing &&
    typeof thing === 'string' &&
    legacyUrls.find(legacyUrl => {
      return thing.indexOf(legacyUrl) === 0
    })
  )
}

export const fixImageURLs = (result, recursive) => {
  if (checkUrl(result)) {
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
  },
}
