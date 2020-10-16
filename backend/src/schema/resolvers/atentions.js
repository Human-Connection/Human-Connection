import { v4 as uuid } from 'uuid'
import Resolver from './helpers/Resolver'

export default {
  Mutation: {
    provideAtentionService: async (object, params, context, resolveInfo) => {
      const { orgID } = params
      const { ServiceID } = params
      const { userID } = params
      const { driver } = context
      // Adding relationship from atention to organization by passing in the orgId,
      // but we do not want to create the atention with orgId as an attribute
      // because we use relationships for this. So, we are deleting it from params
      // before atention creation.
      delete params.orgID
      delete params.ServiceID
      delete params.userID
      params.id = uuid()

      const session = driver.session()

      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createAtentionTransactionResponse = await transaction.run(
          ` 
            MATCH (org:Organization {id: $orgID})
            MATCH (ser:Service {id: $serviceID})
            MATCH (recipient:User {id: $userID})
            WITH org, recipient, ser
            CREATE (atention:Atention {params})
            SET atention.createdAt = toString(datetime())
            SET atention.updatedAt = toString(datetime())
            MERGE (org)<-[:ATENTIONS]-(atention)<-[:RECEIVED]-(recipient)
            MERGE (ser)<-[:ASERVICE]-(atention)
            RETURN atention
          `,
          { userID: userID, orgID, ServiceID, params },
        )
        return createAtentionTransactionResponse.records.map(
          (record) => record.get('atention').properties,
        )
      })
      try {
        const [atention] = await writeTxResultPromise
        return atention
      } finally {
        session.close()
      }
    },
    provideAtentionCategory: async (object, params, context, resolveInfo) => {
      const { orgID } = params
      const { categoryID } = params
      const { userID } = params
      const { driver } = context
      // Adding relationship from atention to organization by passing in the orgId,
      // but we do not want to create the atention with orgId as an attribute
      // because we use relationships for this. So, we are deleting it from params
      // before atention creation.
      delete params.orgID
      delete params.categoryID
      delete params.userID
      params.id = uuid()

      const session = driver.session()

      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createAtentionTransactionResponse = await transaction.run(
          ` 
            MATCH (org:Organization {id: $orgID})
            MATCH (sc:ServiceCategory {id: $categoryID})
            MATCH (recipient:User {id: $userID})
            WITH org, recipient, sc
            CREATE (atention:Atention {params})
            SET atention.createdAt = toString(datetime())
            SET atention.updatedAt = toString(datetime())
            MERGE (org)<-[:ATENTIONS]-(atention)<-[:RECEIVED]-(recipient)
            MERGE (sc)<-[:ACATEGORY]-(atention)
            RETURN atention
          `,
          { userID: userID, orgID, categoryID, params },
        )
        return createAtentionTransactionResponse.records.map(
          (record) => record.get('atention').properties,
        )
      })
      try {
        const [atention] = await writeTxResultPromise
        return atention
      } finally {
        session.close()
      }
    },
  },
  Atention: {
    ...Resolver('Atention', {
      hasOne: {
        recipient: '<-[:RECEIVED]-(related:User)',
        organization: '-[:ATENTIONS]->(related:Organization)',
        service: '-[:ASERVICE]->(related:Service)',
        scategory: '-[:ACATEGORY]->(related:ServiceCategory)',
      },
    }),
  },
}
