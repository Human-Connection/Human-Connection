import { makeAugmentedSchema } from 'neo4j-graphql-js'
import CONFIG from './../config'
import applyScalars from './../bootstrap/scalars'
import applyDirectives from './../bootstrap/directives'
import typeDefs from './types'
import resolvers from './resolvers'

export default applyScalars(
  applyDirectives(
    makeAugmentedSchema({
      typeDefs,
      resolvers,
      config: {
        query: false,
        mutation: {
          exclude: ['Notfication', 'Statistics', 'LoggedInUser'],
        },
        debug: CONFIG.DEBUG,
      },
    }),
  ),
)
