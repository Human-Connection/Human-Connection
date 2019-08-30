import faker from 'faker'
import slugify from 'slug'
import uuid from 'uuid/v4'

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      const defaults = {
        id: uuid(),
        slug: '',
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
      defaults.slug = slugify(defaults.title, { lower: true })
      args = {
        ...defaults,
        ...args,
      }
      const { categoryIds } = args
      if (!categoryIds.length) throw new Error('CategoryIds are empty!')
      const categories = await Promise.all(
        categoryIds.map(c => {
          return neodeInstance.find('Category', c)
        }),
      )
      const author = args.author || (await neodeInstance.create('User', args))
      delete args.author
      const post = await neodeInstance.create('Post', args)
      await post.relateTo(author, 'author')
      await Promise.all(categories.map(c => c.relateTo(post, 'post')))
      return post
    },
  }
}
