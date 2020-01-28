import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'
import faker from 'faker'
import slugify from 'slug'
import uuid from 'uuid/v4'

const neode = getNeode()

Factory.define('post')
  .option('categoryIds', [])
  .option('categories', ['categoryIds'], categoryIds => {
    if (categoryIds.length) return Promise.all(categoryIds.map(id => neode.find('Category', id)))
    // there must be at least one category
    return Promise.all([Factory.build('category')])
  })
  .option('tagIds', [])
  .option('tags', ['tagIds'], tagIds => {
    return Promise.all(tagIds.map(id => neode.find('Tag', id)))
  })
  .option('authorId', null)
  .option('author', ['authorId'], authorId => {
    if (authorId) return neode.find('User', authorId)
    return Factory.build('user')
  })
  .option('pinnedBy', null)
  .attrs({
    id: uuid,
    title: faker.lorem.sentence,
    content: faker.lorem.paragraphs,
    image: faker.image.unsplash.imageUrl,
    visibility: 'public',
    deleted: false,
    imageBlurred: false,
    imageAspectRatio: 1.333,
  })
  .attr('pinned', ['pinned'], pinned => {
    // Convert false to null
    return pinned || null
  })
  .attr('contentExcerpt', ['contentExcerpt', 'content'], (contentExcerpt, content) => {
    return contentExcerpt || content
  })
  .attr('slug', ['slug', 'title'], (slug, title) => {
    return slug || slugify(title, { lower: true })
  })
  .after(async (buildObject, options) => {
    const [post, author, categories, tags] = await Promise.all([
      neode.create('Post', buildObject),
      options.author,
      options.categories,
      options.tags,
    ])
    await Promise.all([
      post.relateTo(author, 'author'),
      Promise.all(categories.map(c => c.relateTo(post, 'post'))),
      Promise.all(tags.map(t => t.relateTo(post, 'post'))),
    ])
    if (buildObject.pinned) {
      const pinnedBy = await (options.pinnedBy || Factory.build('user', { role: 'admin' }))
      await pinnedBy.relateTo(post, 'pinned')
    }
    return post
  })

export default function create() {
  return {
    factory: async ({ args, options, neodeInstance, factoryInstance }) => {
      return Factory.build('post', args, options)
    },
  }
}
