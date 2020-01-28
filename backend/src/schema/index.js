import { makeAugmentedSchema } from 'neo4j-graphql-js'
import typeDefs from './types'
import resolvers from './resolvers'

export default makeAugmentedSchema({
  typeDefs,
  resolvers,
  config: {
    query: {
      exclude: [
        'Badge',
        'Embed',
        'EmailAddress',
        'Notfication',
        'Statistics',
        'LoggedInUser',
        'Location',
        'SocialMedia',
        'NOTIFIED',
        'FILED',
        'REVIEWED',
        'Report',
        'Donations',
      ],
    },
    mutation: false,
  },
})
