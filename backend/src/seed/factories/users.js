import faker from 'faker'
import uuid from 'uuid/v4'
import { createUser } from '../../schema/resolvers/users'
import slugify from 'slug'

export default function create(params) {
  return {
    factory: async ({args, driver}) => {
      const defaults = {
        id: uuid(),
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: '1234',
        role: 'user',
        avatar: faker.internet.avatar(),
        about: faker.lorem.paragraph(),
        isVerified: true,
      }
      defaults.slug = slugify(defaults.name, { lower: true })
      args = {
        ...defaults,
        ...args
      }
      return createUser({args, driver})
    }
  }
}
