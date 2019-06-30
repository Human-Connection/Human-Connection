import faker from 'faker'
import uuid from 'uuid/v4'
import { encryptPassword } from '../../schema/resolvers/registration'
import { neode } from '../../bootstrap/neo4j'
import slugify from 'slug'

const instance = neode()

export default function create(params) {
  return {
    factory: async ({ args, driver }) => {
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
        ...args,
      }
      args = await encryptPassword(args)
      const user = await instance.create('User', args)
      return user.toJson()
    },
  }
}
