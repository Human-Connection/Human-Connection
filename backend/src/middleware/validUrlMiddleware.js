const validURL = str => {
  const isValid = str.match(/^(?:https?:\/\/)(?:[^@\n])?(?:www\.)?([^:\/\n?]+)/g)
  return !!isValid
}

export default {
  Mutation: {
    CreateSocialMedia: async (resolve, root, args, context, info) => {
      let socialMedia
      if (validURL(args.url)) {
        socialMedia = await resolve(root, args, context, info)
      } else {
        throw Error('Input is not a URL')
      }
      return socialMedia
    }
  }
}