import uuid from 'uuid/v4'
import faker from 'faker'
import slugify from 'slug'
import { hashSync } from 'bcryptjs'
import { Factory } from 'rosie'
import { getDriver, getNeode } from './db/neo4j'

const neode = getNeode()

export const cleanDatabase = async (options = {}) => {
  const { driver = getDriver() } = options
  const session = driver.session()
  try {
    await session.writeTransaction(transaction => {
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

Factory.define('image')
  .attr('url', faker.image.unsplash.imageUrl)
  .attr('urlW34', () => faker.image.unsplash.imageUrl(34))
  .attr('urlW160', () => faker.image.unsplash.imageUrl(160))
  .attr('urlW320', () => faker.image.unsplash.imageUrl(320))
  .attr('urlW640', () => faker.image.unsplash.imageUrl(640))
  .attr('urlW1024', () => faker.image.unsplash.imageUrl(1024))
  .attr('aspectRatio', 1)
  .attr('alt', faker.lorem.sentence)
  .after((buildObject, options) => {
    return neode.create('Image', buildObject)
  })

Factory.define('category')
  .attr('id', uuid)
  .attr('icon', 'img/badges/fundraisingbox_de_airship.svg')
  .attr('name', 'Some category name')
  .after((buildObject, options) => {
    return neode.create('Category', buildObject)
  })

Factory.define('badge')
  .attr('type', 'crowdfunding')
  .attr('status', 'permanent')
  .after((buildObject, options) => {
    return neode.create('Badge', buildObject)
  })

Factory.define('userWithoutEmailAddress')
  .option('password', '1234')
  .attrs({
    id: uuid,
    name: faker.name.findName,
    email: faker.internet.email,
    password: '1234',
    role: 'user',
    avatar: faker.internet.avatar,
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
  .attr('encryptedPassword', ['password'], password => {
    return hashSync(password, 10)
  })
  .after(async (buildObject, options) => {
    return neode.create('User', buildObject)
  })

Factory.define('user')
  .extend('userWithoutEmailAddress')
  .option('email', faker.internet.exampleEmail)
  .after(async (buildObject, options) => {
    const [user, email] = await Promise.all([
      buildObject,
      neode.create('EmailAddress', { email: options.email }),
    ])
    await Promise.all([user.relateTo(email, 'primaryEmail'), email.relateTo(user, 'belongsTo')])
    return user
  })

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
  .option('image', null)
  .option('pinnedBy', null)
  .attrs({
    id: uuid,
    title: faker.lorem.sentence,
    content: faker.lorem.paragraphs,
    visibility: 'public',
    deleted: false,
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
    const [post, author, categories, tags, image] = await Promise.all([
      neode.create('Post', buildObject),
      options.author,
      options.categories,
      options.tags,
      options.image,
    ])
    await Promise.all([
      post.relateTo(author, 'author'),
      Promise.all(categories.map(c => c.relateTo(post, 'post'))),
      Promise.all(tags.map(t => t.relateTo(post, 'post'))),
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
  .option('post', ['postId'], postId => {
    if (postId) return neode.find('Post', postId)
    return Factory.build('post')
  })
  .option('authorId', null)
  .option('author', ['authorId'], authorId => {
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
