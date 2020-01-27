import uuid from 'uuid/v4'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('donations')
  .attr('id', uuid)
  .attr('goal', 15000)
  .attr('progress', 0)
  .after((buildObject, options) => {
    return neode.create('Donations', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('donations', args)
    },
  }
}
