import { v4 as uuid } from 'uuid'
import { neo4jgraphql } from 'neo4j-graphql-js'
import { mergeImage } from './images/images'
import Resolver from './helpers/Resolver'


export default {
  Query: {
    Organization: async (object, params, context, resolveInfo) => {
      console.log("Organization", params)
      let tmp = await neo4jgraphql(object, params, context, resolveInfo)
      console.log(tmp)
      return tmp
    },
  },
  Mutation: {
    CreateOrganization: async (object, params, context, resolveInfo) => {
      console.log("Incoming params:", params)
      params.id = params.id || uuid()
      const { categoryIds, image: imageInput } = params
      delete params.categoryIds
      delete params.image
      console.log("Outgoing params:", params)
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createOrganizationTransactionResponse = await transaction.run(
          `
            CREATE (organization:Organization)
            SET organization += $params
            SET organization.createdAt = toString(datetime())
            SET organization.updatedAt = toString(datetime())
            WITH organization
            MATCH (creator:User {id: $userId})
            MERGE (organization)<-[:CREATED]-(creator)
            WITH organization
            UNWIND $categoryIds AS categoryId
            MATCH (category:Category {id: categoryId})
            MERGE (organization)-[:CATEGORIZED]->(category)
            RETURN organization {.*}
          `,
          { userId: context.user.id, categoryIds, params },
        )
        const [organization] = createOrganizationTransactionResponse.records.map((record) => record.get('organization'))
        if (imageInput) {
          await mergeImage(organization, 'HERO_IMAGE', imageInput, { transaction })
        }
        return organization
      })
      try {
        const organization = await writeTxResultPromise
        return organization
      } catch (e) {
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('Organization with this slug already exists!')
        throw new Error(e)
      } finally {
        session.close()
      }
    },
  },
  Organization: {
    ...Resolver('Organization', {
      undefinedToNull: [],
      hasMany: {
        //tags: '-[:TAGGED]->(related:Tag)',
        categories: '-[:CATEGORIZED]->(related:Category)',
      },
      hasOne: {
        creator: '<-[:CREATED]-(related:User)',
        image: '-[:HERO_IMAGE]->(related:Image)',
      },
      count: {
      },
      boolean: {
      },
    }),
  },
}
