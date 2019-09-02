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

      let { categories, categoryIds } = args
      delete args.categories
      delete args.categoryIds
      if (categories && categoryIds) throw new Error('You provided both category and categoryIds')
      if (categoryIds)
        categories = await Promise.all(categoryIds.map(id => neodeInstance.find('Category', id)))
      categories = categories || (await Promise.all([factoryInstance.create('Category')]))

      const { tagIds = [] } = args
      delete args.tags
      const tags = await Promise.all(
        tagIds.map(t => {
          return neodeInstance.find('Tag', t)
        }),
      )

      let { author, authorId } = args
      delete args.author
      delete args.authorId
      if (author && authorId) throw new Error('You provided both author and authorId')
      if (authorId) author = await neodeInstance.find('User', authorId)
      author = author || (await factoryInstance.create('User'))

      const post = await neodeInstance.create('Post', args)
      await post.relateTo(author, 'author')
      await Promise.all(categories.map(c => c.relateTo(post, 'post')))
      await Promise.all(tags.map(t => t.relateTo(post, 'post')))
      return post
    },
  }
}
