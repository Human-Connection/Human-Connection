import Resolver from './helpers/Resolver'

export default {
  ServiceCategory: {
    ...Resolver('ServiceCategory', {
      hasMany: {
        services: '-[:DENOMINATION]->(related:Service)',
        organizations: '-[:SCATEGORY]->(related:Organization)',
      },
    }),
  },
}
