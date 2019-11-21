// Wolle import { undefinedToNullResolver } from './helpers/Resolver'

// Wolle const queryOpenDecisionWriteTransaction = (session, resourceId) => {
//   return session.writeTransaction(async txc => {
//     const queryOpenDecisionTransactionResponse = await txc.run(
//       `
//         //MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
//         //WHERE resource:User OR resource:Comment OR resource:Post
//         //RETURN decision, moderator {.id} AS decisionModerator

//         // Wolle only review on reported resources

//         MATCH (caseModerator:User)-[:REPORTED]->(caseFolder:CaseFolder {closed: false})-[:FLAGGED]->(resource {id: $resourceId})
//         WHERE resource:User OR resource:Post OR resource:Comment
//         RETURN caseFolder, caseModerator {.id}
//       `,
//       { resourceId },
//     )
//     return queryOpenDecisionTransactionResponse.records.map(record => ({
//       caseFolder: record.get('caseFolder'),
//       caseModerator: record.get('caseModerator'),
//     }))
//   })
// }

export default {
  Mutation: {
    decide: async (_object, params, context, _resolveInfo) => {
      // Wolle console.log('params: ', params)
      const { resourceId } = params
      // Wolle console.log('resourceId: ', resourceId)
      const { disable, closed } = params
      // Wolle console.log('disable: ', disable)
      const { user: moderator, driver } = context

      let createdRelationshipWithNestedAttributes = null // return value

      const session = driver.session()
      try {
        // const queryOpenDecisionWriteTxResultPromise = queryOpenDecisionWriteTransaction(
        //   session,
        //   resourceId,
        // )
        // console.log('queryOpenDecisionWriteTxResultPromise: ', queryOpenDecisionWriteTxResultPromise)
        // console.log('queryOpenDecisionWriteTxResultPromise: ', queryOpenDecisionWriteTxResultPromise)
        // console.log('queryOpenDecisionWriteTxResultPromise: ', queryOpenDecisionWriteTxResultPromise)
        // console.log('queryOpenDecisionWriteTxResultPromise: ', queryOpenDecisionWriteTxResultPromise)
        // console.log('queryOpenDecisionWriteTxResultPromise: ', queryOpenDecisionWriteTxResultPromise)
        // const [openDecisionTxResult] = await queryOpenDecisionWriteTxResultPromise

        // let cypherHeader = ''

        // // Wolle openDecisionTxResult should not be undefined !!!
        // if (!openDecisionTxResult) {
        //   // no open caseFolder, then create one
        //   if (disable === undefined) disable = false // default for creation
        //   if (closed === undefined) closed = false // default for creation
        //   cypherHeader = `
        //       MATCH (resource {id: $resourceId})
        //       WHERE resource: User OR resource: Comment OR resource: Post
        //       OPTIONAL MATCH (:User)-[lastDecision:DECIDED {latest: true}]->(resource)
        //       SET (CASE WHEN lastDecision IS NOT NULL THEN lastDecision END).latest = false
        //       WITH resource
        //       MATCH (moderator:User {id: $moderatorId})
        //       CREATE (resource)<-[decision:DECIDED]-(moderator)
        //       SET decision.latest = true
        //       `
        // } else {
        //   // an open caseFolder, then change it
        //   if (disable === undefined) disable = openDecisionTxResult.caseFolder.properties.disable // default set to existing
        //   if (closed === undefined) closed = openDecisionTxResult.caseFolder.properties.closed // default set to existing
        //   // current moderator is not the same as old
        //   if (moderator.id !== openDecisionTxResult.caseModerator.id) {
        //     // from a different moderator, then create relation with properties to new moderator
        //     cypherHeader = `
        //         MATCH (moderator:User)-[oldDecision:DECIDED {closed: false}]->(resource {id: $resourceId})
        //         WHERE resource:User OR resource:Comment OR resource:Post
        //         DELETE oldDecision
        //         MATCH (moderator:User {id: $moderatorId})
        //         MATCH (resource {id: $resourceId})
        //         WHERE resource:User OR resource:Comment OR resource:Post
        //         CREATE (resource)<-[decision:DECIDED]-(moderator)
        //         SET decision = oldDecision
        //       `
        //   } else {
        //     // an open caseFolder from same moderator, then match this
        //     cypherHeader = `
        //         MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
        //         WHERE resource:User OR resource:Comment OR resource:Post
        //       `
        //   }
        // }
        // let decisionUUID = null
        // let cypherClosed = ''
        // if (closed) {
        //   decisionUUID = uuid()
        //   cypherClosed = `
        //       WITH decision, resource, moderator
        //       OPTIONAL MATCH (:User)-[report:REPORTED {closed: false}]->(resource)
        //       SET (CASE WHEN report IS NOT NULL THEN report END).closed = true
        //       SET (CASE WHEN report IS NOT NULL THEN report END).decisionUuid = $decisionUUID
        //       SET decision.uuid = $decisionUUID
        //     `
        // }
        // const cypher =
        //   cypherHeader +
        //   `SET decision.updatedAt = toString(datetime())
        //     SET (CASE WHEN decision.createdAt IS NULL THEN decision END).createdAt = decision.updatedAt
        //     SET decision.disable = $disable, decision.closed = $closed
        //     SET resource.disabled = $disable
        //   ` +
        //   cypherClosed +
        //   `RETURN decision, resource, moderator, labels(resource)[0] AS type
        //   `
        const cypher = ` 
            // Wolle only review on reported resources

            MATCH (moderator:User {id: $moderatorId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Post OR resource:Comment
            //WHERE (caseFolder)<-[report:REPORTED]-(submitter:User)

            // no open caseFolder, create one, update existing
            MERGE (resource)<-[:FLAGGED]-(caseFolder:CaseFolder {closed: false})
            ON CREATE SET caseFolder.id = randomUUID(), caseFolder.createdAt = $createdAt, caseFolder.updatedAt = caseFolder.createdAt, caseFolder.rule = 'latestReviewUpdatedAt', caseFolder.disable = $disable, caseFolder.closed = $closed
            ON MATCH SET caseFolder.updatedAt = $createdAt, caseFolder.disable = $disable, caseFolder.closed = $closed

            // Create review on caseFolder
            WITH moderator, resource, caseFolder
            CREATE (caseFolder)<-[review:REVIEWED {createdAt: $createdAt, updatedAt: $createdAt, disable: $disable, closed: $closed}]-(moderator)

            SET resource.disabled = $disable

            RETURN moderator, review, caseFolder {.id}, resource, labels(resource)[0] AS type

            //RETURN decision, resource, moderator, labels(resource)[0] AS type
          `

        // Wolle console.log('cypher: ', cypher)
        // console.log('disable: ', disable)

        // const mutateDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
        //   const mutateDecisionTransactionResponse = await txc.run(
        //     cypher, {
        //     resourceId,
        //     moderatorId: moderator.id,
        //     disable,
        //     closed,
        //     decisionUUID,
        //   })
        //   return mutateDecisionTransactionResponse.records.map(record => ({
        //     decision: record.get('decision'),
        //     resource: record.get('resource'),
        //     moderator: record.get('moderator'),
        //     type: record.get('type'),
        //   }))
        // })
        const mutateDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
          const mutateDecisionTransactionResponse = await txc.run(cypher, {
            resourceId,
            moderatorId: moderator.id,
            createdAt: new Date().toISOString(),
            disable,
            closed,
          })
          return mutateDecisionTransactionResponse.records.map(record => ({
            moderator: record.get('moderator'),
            review: record.get('review'),
            caseFolder: record.get('caseFolder'),
            resource: record.get('resource'),
            type: record.get('type'),
          }))
        })
        const txResult = await mutateDecisionWriteTxResultPromise
        if (!txResult[0]) return null
        // const { decision, resource, moderator: moderatorInResult, type } = txResult[0]
        // createdRelationshipWithNestedAttributes = {
        //   ...decision.properties,
        //   moderator: moderatorInResult.properties,
        //   type,
        //   post: null,
        //   comment: null,
        //   user: null,
        // }
        const { moderator: moderatorInResult, review, caseFolder, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...review.properties,
          moderator: moderatorInResult.properties,
          caseFolderId: caseFolder.id,
          type,
          post: null,
          comment: null,
          user: null,
        }
        switch (type) {
          case 'Post':
            createdRelationshipWithNestedAttributes.post = resource.properties
            break
          case 'Comment':
            createdRelationshipWithNestedAttributes.comment = resource.properties
            break
          case 'User':
            createdRelationshipWithNestedAttributes.user = resource.properties
            break
        }
      } finally {
        session.close()
      }

      return createdRelationshipWithNestedAttributes
    },
  },
  REVIEWED: {
    // Wolle ...undefinedToNullResolver(['uuid']),
  },
}
