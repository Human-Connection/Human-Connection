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
        imageBlurred: false,
        imageAspectRatio: 1.333,
        pinned: null,
      }
      args = {
        ...defaults,
        ...args,
      }
      // Convert false to null
      args.pinned = args.pinned || null

      args.slug = args.slug || slugify(args.title, { lower: true })
      args.contentExcerpt = args.contentExcerpt || args.content

      let { categories, categoryIds } = args
      delete args.categories
      delete args.categoryIds
      if (categories && categoryIds) throw new Error('You provided both categories and categoryIds')
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

      const { commentContent } = args
      let comment
      delete args.commentContent
      if (commentContent)
        comment = await factoryInstance.create('Comment', {
          contentExcerpt: commentContent,
          post,
          author,
        })

      await post.relateTo(author, 'author')
      if (comment) await post.relateTo(comment, 'comments')

      if (args.pinned) {
        args.pinnedAt = args.pinnedAt || new Date().toISOString()
        if (!args.pinnedBy) {
          const admin = await factoryInstance.create('User', {
            role: 'admin',
            updatedAt: new Date().toISOString(),
          })
          await admin.relateTo(post, 'pinned')
          args.pinnedBy = admin
        }
      }

      await Promise.all(categories.map(c => c.relateTo(post, 'post')))
      await Promise.all(tags.map(t => t.relateTo(post, 'post')))
      return post
    },
  }
}
