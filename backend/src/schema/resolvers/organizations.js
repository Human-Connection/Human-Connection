import { v4 as uuid } from 'uuid'
import { neo4jgraphql } from 'neo4j-graphql-js'
import { mergeImage } from './images/images'
import Resolver from './helpers/Resolver'
import createOrUpdateLocations from './users/location'


export default {
  Query: {
    Organization: async (object, params, context, resolveInfo) => {
      return neo4jgraphql(object, params, context, resolveInfo)
    },
  },
  Mutation: {
    CreateOrganization: async (object, params, context, resolveInfo) => {
      params.id = params.id || uuid()
      const { categoryIds, image: imageInput } = params
      delete params.categoryIds
      delete params.image
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
        await createOrUpdateLocations(params.id, params.locationName, session)
        return organization
      } catch (e) {
        if (e.code === 'Neo.ClientError.Schema.ConstraintValidationFailed')
          throw new UserInputError('Organization with this slug already exists!')
        throw new Error(e)
      } finally {
        session.close()
      }
    },
    UpdateOrganization: async (_parent, params, context, _resolveInfo) => {
      const { categoryIds, image: imageInput } = params
      console.log(categoryIds)
      delete params.categoryIds
      delete params.image
      const session = context.driver.session()
      let updateOrganizationCypher = `
        MATCH (organization:Organization { id: $params.id })
        SET organization += $params
        SET organization.updatedAt = toString(datetime())
        WITH organization
      `

      if (categoryIds && categoryIds.length) {
        const cypherDeletePreviousRelations = `
          MATCH (organization:Organization { id: $params.id })-[previousRelations:CATEGORIZED]->(category:Category)
          DELETE previousRelations
          RETURN organization, category
          `

        await session.writeTransaction((transaction) => {
          return transaction.run(cypherDeletePreviousRelations, { params })
        })

        updateOrganizationCypher += `
          UNWIND $categoryIds AS categoryId
          MATCH (category:Category {id: categoryId})
          MERGE (orgnaization)-[:CATEGORIZED]->(category)
          WITH organization
        `
      }

      updateOrganizationCypher += `RETURN organization {.*}`
      console.log(updateOrganizationCypher)
      const updateOrganizationVariables = { categoryIds, params }
      console.log(updateOrganizationVariables)
      try {
        const writeTxResultPromise = session.writeTransaction(async (transaction) => {
          const updateOrganizationTransactionResponse = await transaction.run(
            updateOrganizationCypher,
            updateOrganizationVariables,
          )
          const [organization] = updateOrganizationTransactionResponse.records.map((record) => record.get('organization'))
          await mergeImage(organization, 'HERO_IMAGE', imageInput, { transaction })
          return organization
        })
        const organization = await writeTxResultPromise
        await createOrUpdateLocations(params.id, params.locationName, session)
        return organization
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
        location: '-[:IS_IN]->(related:Location)',
      },
      count: {
      },
      boolean: {
      },
    }),
  },
}
