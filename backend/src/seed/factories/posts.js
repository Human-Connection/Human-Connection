import faker from 'faker'
import slugify from 'slug'
import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance, factoryInstance }) => {
      const defaults = {
        id: uuid(),
        title: faker.lorem.sentence(),
        content: [
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
          faker.lorem.sentence(),
        ].join('. '),
        image: faker.image.unsplash.imageUrl(),
        visibility: 'public',
        deleted: false,
        categoryIds: [],
      }
      args = {
        ...defaults,
        ...args,
      }
      args.slug = args.slug || slugify(args.title, { lower: true })
      args.contentExcerpt = args.contentExcerpt || args.content

      const { categoryIds } = args
      if (!categoryIds.length) throw new Error('CategoryIds are empty!')
      const categories = await Promise.all(
        categoryIds.map(c => {
          return neodeInstance.find('Category', c)
        }),
      )

      let { author, authorId } = args
      delete args.author
      delete args.authorId
      if (author && authorId) throw new Error('You provided both author and authorId')
      if (authorId) author =  await neodeInstance.find('User', authorId)
      author = author || (await factoryInstance.create('User', args))

      const post = await neodeInstance.create('Post', args)
      await post.relateTo(author, 'author')
      await Promise.all(categories.map(c => c.relateTo(post, 'post')))
      return post
    },
  }
}
