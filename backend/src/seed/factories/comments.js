import faker from 'faker'
import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        id: uuid(),
        content: [faker.lorem.sentence(), faker.lorem.sentence()].join('. '),
      }
      args = {
        ...defaults,
        ...args,
      }
      const { postId } = args
      if (!postId) throw new Error('PostId is missing!')
      const post = await neodeInstance.find('Post', postId)
      delete args.postId
      const author = args.author || (await neodeInstance.create('User', args))
      delete args.author
      const comment = await neodeInstance.create('Comment', args)
      await comment.relateTo(post, 'post')
      await comment.relateTo(author, 'author')
      return comment
    },
  }
}
