import faker from 'faker'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

export const defaults = {
  email: faker.internet.email,
  verifiedAt: () => new Date().toISOString(),
}

const neode = getNeode()

Factory.define('emailAddress')
  .attr(defaults)
  .after((buildObject, options) => {
    return neode.create('EmailAddress', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('emailAddress', args)
    },
  }
}
