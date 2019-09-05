import faker from 'faker'
import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance, factoryInstance }) => {
      const defaults = {
        id: uuid(),
        content: [faker.lorem.sentence(), faker.lorem.sentence()].join('. '),
      }
      args = {
        ...defaults,
        ...args,
      }
      args.contentExcerpt = args.contentExcerpt || args.content

      let { post, postId } = args
      delete args.post
      delete args.postId
      if (post && postId) throw new Error('You provided both post and postId')
      if (postId) post = await neodeInstance.find('Post', postId)
      post = post || (await factoryInstance.create('Post'))

      let { author, authorId } = args
      delete args.author
      delete args.authorId
      if (author && authorId) throw new Error('You provided both author and authorId')
      if (authorId) author = await neodeInstance.find('User', authorId)
      author = author || (await factoryInstance.create('User'))

      delete args.author
      const comment = await neodeInstance.create('Comment', args)
      await comment.relateTo(post, 'post')
      await comment.relateTo(author, 'author')
      return comment
    },
  }
}
