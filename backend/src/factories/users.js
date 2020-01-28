import faker from 'faker'
import uuid from 'uuid/v4'
import slugify from 'slug'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'
import { hashSync } from 'bcryptjs'

const neode = getNeode()

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
  .option('email', faker.internet.exampleEmail)
  .extend('userWithoutEmailAddress')
  .after(async (buildObject, options) => {
    const [user, email] = await Promise.all([
      buildObject,
      neode.create('EmailAddress', { email: options.email }),
    ])
    await Promise.all([user.relateTo(email, 'primaryEmail'), email.relateTo(user, 'belongsTo')])
    return user
  })

export default function create() {
  return {
    factory: async ({ args, options }) => {
      return Factory.build('user', args, options)
    },
  }
}
