import Resolver from './helpers/Resolver'
import { UserInputError } from 'apollo-server'

export default {
  Mutation: {
    UpdateOrganization: async (_parent, params, context, _resolveInfo) => {
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const updateOrgTransactionResponse = await transaction.run(
          `
            MATCH (org:Organization {id: $params.id})
            SET org += $params
            SET org.updatedAt = toString(datetime())
            RETURN org {.*}
          `,
          { params },
        )
        const [org] = updateOrgTransactionResponse.records.map((record) => record.get('org'))
        return org
      })
      try {
        const user = await writeTxResultPromise
        return user
      } catch (error) {
        throw new UserInputError(error.message)
      } finally {
        session.close()
      }
    },
  },
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
