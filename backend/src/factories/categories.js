import uuid from 'uuid/v4'
import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('category')
  .attr('id', uuid)
  .attr('icon', 'img/badges/fundraisingbox_de_airship.svg')
  .attr('name', 'Some category name')
  .after((buildObject, options) => {
    return neode.create('Category', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('category', args)
    },
  }
}
