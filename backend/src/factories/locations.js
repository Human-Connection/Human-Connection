import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('location')
  .attrs({
    name: 'Germany',
    namePT: 'Alemanha',
    nameDE: 'Deutschland',
    nameES: 'Alemania',
    nameNL: 'Duitsland',
    namePL: 'Niemcy',
    nameFR: 'Allemagne',
    nameIT: 'Germania',
    nameEN: 'Germany',
    id: 'country.10743216036480410',
    type: 'country',
  })
  .after((buildObject, options) => {
    return neode.create('Location', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args, neodeInstance }) => {
      return Factory.build('location', args)
    },
  }
}
