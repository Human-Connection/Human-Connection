// Wolle import { undefinedToNullResolver } from './helpers/Resolver'

// Wolle const queryOpenDecisionWriteTransaction = (session, resourceId) => {
//   return session.writeTransaction(async txc => {
//     const queryOpenDecisionTransactionResponse = await txc.run(
//       `
//         //MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
//         //WHERE resource:User OR resource:Comment OR resource:Post
//         //RETURN decision, moderator {.id} AS decisionModerator

//         // Wolle only review on reported resources

//         MATCH (caseModerator:User)-[:REPORTED]->(claim:Claim {closed: false})-[:BELONGS_TO]->(resource {id: $resourceId})
//         WHERE resource:User OR resource:Post OR resource:Comment
//         RETURN claim, caseModerator {.id}
//       `,
//       { resourceId },
//     )
//     return queryOpenDecisionTransactionResponse.records.map(record => ({
//       claim: record.get('claim'),
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
      let { disable, closed } = params
      disable = disable === undefined ? null : disable
      closed = closed === undefined ? null : closed
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
        //   // no open claim, then create one
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
        //   // an open claim, then change it
        //   if (disable === undefined) disable = openDecisionTxResult.claim.properties.disable // default set to existing
        //   if (closed === undefined) closed = openDecisionTxResult.claim.properties.closed // default set to existing
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
        //     // an open claim from same moderator, then match this
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
            // report exists?
            //WHERE (claim)<-[report:REPORTED]-(submitter:User)

            // no open claim, create one, update existing
            MERGE (resource)<-[:BELONGS_TO]-(claim:Claim {closed: false})
            ON CREATE SET claim.id = randomUUID(), claim.createdAt = $dateTime, claim.updatedAt = claim.createdAt, claim.rule = 'latestReviewUpdatedAtRules', claim.disable = false, claim.closed = false
            ON MATCH SET claim.updatedAt = $dateTime
            // claim.disable and claim.closed are set after setting them in review

            // Create review on claim
            WITH moderator, resource, claim
            MERGE (claim)<-[review:REVIEWED]-(moderator)
            ON CREATE SET review.createdAt = $dateTime, review.updatedAt = review.createdAt,
              review.disable = CASE WHEN $disable IS NULL
                THEN false
                ELSE $disable END,
              review.closed = CASE WHEN $closed IS NULL
                THEN false
                ELSE $closed END
            ON MATCH SET
              review.updatedAt = $dateTime,
              review.disable = CASE WHEN $disable IS NULL
                THEN review.disable
                ELSE $disable END,
              review.closed = CASE WHEN $closed IS NULL
                THEN review.closed
                ELSE $closed END

            SET claim.disable = review.disable, claim.closed = review.closed
            SET resource.disabled = review.disable

            RETURN moderator, review, claim {.id}, resource, labels(resource)[0] AS type
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
            dateTime: new Date().toISOString(),
            disable,
            closed,
          })
          return mutateDecisionTransactionResponse.records.map(record => ({
            moderator: record.get('moderator'),
            review: record.get('review'),
            claim: record.get('claim'),
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
        const { moderator: moderatorInResult, review, claim, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...review.properties,
          moderator: moderatorInResult.properties,
          claimId: claim.id,
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
