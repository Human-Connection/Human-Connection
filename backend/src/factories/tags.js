import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('tag')
  .attrs({
    name: '#human-connection',
  })
  .after((buildObject, options) => {
    return neode.create('Tag', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('tag', args)
    },
  }
}
