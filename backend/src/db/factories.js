import { v4 as uuid } from 'uuid'
import faker from 'faker'
import slugify from 'slug'
import { hashSync } from 'bcryptjs'
import { Factory } from 'rosie'
import { getDriver, getNeode } from './neo4j'
import CONFIG from '../config/index.js'

const neode = getNeode()

const uniqueImageUrl = (imageUrl) => {
  const newUrl = new URL(imageUrl, CONFIG.CLIENT_URI)
  newUrl.search = `random=${uuid()}`
  return newUrl.toString()
}

export const cleanDatabase = async (options = {}) => {
  const { driver = getDriver() } = options
  const session = driver.session()
  try {
    await session.writeTransaction((transaction) => {
      return transaction.run(
        `
          MATCH (everything)
          DETACH DELETE everything
        `,
      )
    })
  } finally {
    session.close()
  }
}

Factory.define('category')
  .attr('id', uuid)
  .attr('icon', 'globe')
  .attr('name', 'Global Peace & Nonviolence')
  .after((buildObject, options) => {
    return neode.create('Category', buildObject)
  })

Factory.define('badge')
  .attr('type', 'crowdfunding')
  .attr('status', 'permanent')
  .after((buildObject, options) => {
    return neode.create('Badge', buildObject)
  })

Factory.define('image')
  .attr('url', faker.image.unsplash.imageUrl)
  .attr('aspectRatio', 1)
  .attr('alt', faker.lorem.sentence)
  .after((buildObject, options) => {
    const { url: imageUrl } = buildObject
    if (imageUrl) buildObject.url = uniqueImageUrl(imageUrl)
    return neode.create('Image', buildObject)
  })

Factory.define('basicUser')
  .option('password', '1234')
  .attrs({
    id: uuid,
    name: faker.name.findName,
    password: '1234',
    role: 'user',
    about: faker.lorem.paragraph,
    termsAndConditionsAgreedVersion: '0.0.1',
    termsAndConditionsAgreedAt: '2019-08-01T10:47:19.212Z',
    allowEmbedIframes: false,
    showShoutsPublicly: false,
    locale: 'en',
  })
  .attr('slug', ['slug', 'name'], (slug, name) => {
    return slug || slugify(name, { lower: true })
  })
  .attr('encryptedPassword', ['password'], (password) => {
    return hashSync(password, 10)
  })

Factory.define('userWithoutEmailAddress')
  .extend('basicUser')
  .after(async (buildObject, options) => {
    return neode.create('User', buildObject)
  })

Factory.define('user')
  .extend('basicUser')
  .option('email', faker.internet.exampleEmail)
  .option('avatar', () =>
    Factory.build('image', {
      url: faker.internet.avatar(),
    }),
  )
  .after(async (buildObject, options) => {
    const [user, email, avatar] = await Promise.all([
      neode.create('User', buildObject),
      neode.create('EmailAddress', { email: options.email }),
      options.avatar,
    ])
    await Promise.all([user.relateTo(email, 'primaryEmail'), email.relateTo(user, 'belongsTo')])
    if (avatar) await user.relateTo(avatar, 'avatar')
    return user
  })

Factory.define('post')
  .option('categoryIds', [])
  .option('categories', ['categoryIds'], (categoryIds) => {
    if (categoryIds.length) return Promise.all(categoryIds.map((id) => neode.find('Category', id)))
    // there must be at least one category
    return Promise.all([Factory.build('category')])
  })
  .option('tagIds', [])
  .option('tags', ['tagIds'], (tagIds) => {
    return Promise.all(tagIds.map((id) => neode.find('Tag', id)))
  })
  .option('authorId', null)
  .option('author', ['authorId'], (authorId) => {
    if (authorId) return neode.find('User', authorId)
    return Factory.build('user')
  })
  .option('pinnedBy', null)
  .option('image', () => Factory.build('image'))
  .attrs({
    id: uuid,
    title: faker.lorem.sentence,
    content: faker.lorem.paragraphs,
    visibility: 'public',
    deleted: false,
    imageBlurred: false,
    imageAspectRatio: 1.333,
  })
  .attr('pinned', ['pinned'], (pinned) => {
    // Convert false to null
    return pinned || null
  })
  .attr('contentExcerpt', ['contentExcerpt', 'content'], (contentExcerpt, content) => {
    return contentExcerpt || content
  })
  .attr('slug', ['slug', 'title'], (slug, title) => {
    return slug || slugify(title, { lower: true })
  })
  .attr('language', ['language'], (language) => {
    return language || 'en'
  })
  .after(async (buildObject, options) => {
    const [post, author, image, categories, tags] = await Promise.all([
      neode.create('Post', buildObject),
      options.author,
      options.image,
      options.categories,
      options.tags,
    ])
    await Promise.all([
      post.relateTo(author, 'author'),
      Promise.all(categories.map((c) => c.relateTo(post, 'post'))),
      Promise.all(tags.map((t) => t.relateTo(post, 'post'))),
    ])
    if (image) await post.relateTo(image, 'image')
    if (buildObject.pinned) {
      const pinnedBy = await (options.pinnedBy || Factory.build('user', { role: 'admin' }))
      await pinnedBy.relateTo(post, 'pinned')
    }
    return post
  })

Factory.define('comment')
  .option('postId', null)
  .option('post', ['postId'], (postId) => {
    if (postId) return neode.find('Post', postId)
    return Factory.build('post')
  })
  .option('authorId', null)
  .option('author', ['authorId'], (authorId) => {
    if (authorId) return neode.find('User', authorId)
    return Factory.build('user')
  })
  .attrs({
    id: uuid,
    content: faker.lorem.sentence,
  })
  .attr('contentExcerpt', ['contentExcerpt', 'content'], (contentExcerpt, content) => {
    return contentExcerpt || content
  })
  .after(async (buildObject, options) => {
    const [comment, author, post] = await Promise.all([
      neode.create('Comment', buildObject),
      options.author,
      options.post,
    ])
    await Promise.all([comment.relateTo(author, 'author'), comment.relateTo(post, 'post')])
    return comment
  })

Factory.define('donations')
  .attr('id', uuid)
  .attr('goal', 15000)
  .attr('progress', 0)
  .after((buildObject, options) => {
    return neode.create('Donations', buildObject)
  })

const emailDefaults = {
  email: faker.internet.email,
  verifiedAt: () => new Date().toISOString(),
}

Factory.define('emailAddress')
  .attr(emailDefaults)
  .after((buildObject, options) => {
    return neode.create('EmailAddress', buildObject)
  })

Factory.define('unverifiedEmailAddress')
  .attr(emailDefaults)
  .after((buildObject, options) => {
    return neode.create('UnverifiedEmailAddress', buildObject)
  })

Factory.define('location')
  .attrs({
    name: 'Germany',
    namePT: 'Alemanha',
    nameDE: 'Deutschland',
    nameES: 'Alemania',
    nameNL: 'Duitsland',
    namePL: 'Niemcy',
    nameFR: 'Allemagne',
    nameIT: 'Germania',
    nameEN: 'Germany',
    id: 'country.10743216036480410',
    type: 'country',
  })
  .after((buildObject, options) => {
    return neode.create('Location', buildObject)
  })

Factory.define('report').after((buildObject, options) => {
  return neode.create('Report', buildObject)
})

Factory.define('tag')
  .attrs({
    name: '#human-connection',
  })
  .after((buildObject, options) => {
    return neode.create('Tag', buildObject)
  })

Factory.define('socialMedia')
  .attrs({
    url: 'https://mastodon.social/@Gargron',
  })
  .after((buildObject, options) => {
    return neode.create('SocialMedia', buildObject)
  })

export default Factory
