import Resolver from './helpers/Resolver'

export default {
  Organization: {
    ...Resolver('Organization', {
      hasOne: {
        plan: '-[:SUBSCRIBED]->(related:Plan)',
        location: '-[:IS_IN]->(related:Location)',
      },
      hasMany: {
        services: '-[:PROVIDES]->(related:Service)',
      },
    }),
  },
}
