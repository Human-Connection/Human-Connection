import replaceParams from './replaceParams'

const replaceFilterBubbleParams = async (resolve, root, args, context, resolveInfo) => {
  args = await replaceParams(args, context)
  return resolve(root, args, context, resolveInfo)
}

export default {
  Query: {
    Post: replaceFilterBubbleParams,
  },
}
