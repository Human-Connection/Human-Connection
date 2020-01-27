import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('report').after((buildObject, options) => {
  return neode.create('Report', buildObject)
})

export default function create() {
  return {
    factory: async ({ args }) => {
      return Factory.build('report', args)
    },
  }
}
