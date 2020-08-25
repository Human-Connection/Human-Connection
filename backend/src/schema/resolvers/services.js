import Resolver from './helpers/Resolver'

export default {
  Service: {
    ...Resolver('Service', {
      hasOne: {
        organization: '-[:BELONGS]->(related:Organization)',
        serviceCategory: '-[:CATEGORY]->(related:ServiceCategory)',
      },
    }),
  },
}
