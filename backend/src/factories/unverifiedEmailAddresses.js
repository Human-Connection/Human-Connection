import { defaults } from './emailAddresses.js'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('unverifiedEmailAddress')
  .attr(defaults)
  .after((buildObject, options) => {
    return neode.create('UnverifiedEmailAddress', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('unverifiedEmailAddress', args)
    },
  }
}
