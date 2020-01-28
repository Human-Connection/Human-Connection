import { Factory } from 'rosie'
import { getNeode } from '../db/neo4j'

const neode = getNeode()

Factory.define('socialMedia')
  .attrs({
    url: 'https://mastodon.social/@Gargron',
  })
  .after((buildObject, options) => {
    return neode.create('SocialMedia', buildObject)
  })

export default function create() {
  return {
    factory: async ({ args }) => {
      return Factory.build('socialMedia', args)
    },
  }
}
