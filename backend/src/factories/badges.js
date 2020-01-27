import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('badge')
  .attr('type', 'crowdfunding')
  .attr('status', 'permanent')
  .after((buildObject, options) => {
    return neode.create('Badge', buildObject)
  })

export default function create() {
  return {
    factory: ({ args, neodeInstance }) => {
      return Factory.build('badge', args)
    },
  }
}
