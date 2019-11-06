import uuid from 'uuid/v4'

export default {
  Mutation: {
    decide: async (_object, params, context, _resolveInfo) => {
      let createdRelationshipWithNestedAttributes = null
      // Wolle console.log('params: ', params)
      const { resourceId } = params
      // Wolle console.log('resourceId: ', resourceId)
      let { disable, closed } = params
      // Wolle console.log('disable: ', disable)
      const { user: moderator, driver } = context

      const session = driver.session()

      const existingDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
        const decisionRelationshipTransactionResponse = await txc.run(
          `
            MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
            WHERE resource:User OR resource:Comment OR resource:Post
            RETURN decision, moderator {.id} AS decisionModerator
          `,
          { resourceId },
        )
        return decisionRelationshipTransactionResponse.records.map(record => ({
          decision: record.get('decision'),
          decisionModerator: record.get('decisionModerator'),
        }))
      })

      try {
        let cypherHeader = ''

        // is there an open decision?
        const [existingDecisionTxResult] = await existingDecisionWriteTxResultPromise
        if (!existingDecisionTxResult) {
          // no open decision, then create one
          if (disable === undefined) disable = false // default for creation
          if (closed === undefined) closed = false // default for creation
          cypherHeader = `
              MATCH (moderator:User {id: $moderatorId})
              MATCH (resource {id: $resourceId})
              WHERE resource:User OR resource:Comment OR resource:Post
              CREATE (resource)<-[decision:DECIDED]-(moderator)
              SET decision.last = true
              WITH decision, resource, moderator
              OPTIONAL MATCH (:User)-[lastDecision:DECIDED {last: true}]->(resource)
              SET (
              CASE
              WHEN lastDecision IS NOT NULL
              THEN lastDecision END).last = false
            `
        } else {
          // an open decision …
          if (disable === undefined) disable = existingDecisionTxResult.decision.properties.disable // default set to existing
          if (closed === undefined) closed = existingDecisionTxResult.decision.properties.closed // default set to existing
          // current moderator is not the same as old
          if (moderator.id !== existingDecisionTxResult.decisionModerator.id) {
            // an open decision from different moderator, then change relation and properties
            cypherHeader = `
                MATCH (moderator:User)-[oldDecision:DECIDED {closed: false}]->(resource {id: $resourceId})
                WHERE resource:User OR resource:Comment OR resource:Post
                DELETE oldDecision
                MATCH (moderator:User {id: $moderatorId})
                MATCH (resource {id: $resourceId})
                WHERE resource:User OR resource:Comment OR resource:Post
                CREATE (resource)<-[decision:DECIDED]-(moderator)
                SET decision = oldDecision
              `
          } else {
            // an open decision from same moderator, then change properties
            cypherHeader = `
                MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
                WHERE resource:User OR resource:Comment OR resource:Post
              `
          }
        }
        let decisionUUID = null
        let cypherClosed = ''
        // if (closed) {
        //   decisionUUID = uuid()
        //   cypherClosed = `
        //       OPTIONAL MATCH (:User)-[report:REPORTED {closed: false}]->(resource)
        //       SET report.closed = true, report.decisionUuid = $decisionUUID
        //       SET decision.uuid = $decisionUUID
        //     `
        // }
        const cypher =
          cypherHeader +
          `SET (
            CASE
            WHEN decision.createdAt IS NOT NULL
            THEN decision END).updatedAt = toString(datetime())
            SET (
            CASE
            WHEN decision.createdAt IS NULL
            THEN decision END).createdAt = toString(datetime())
            SET decision.disable = $disable, decision.closed = $closed
            SET resource.disabled = $disable
          ` +
          cypherClosed +
          `RETURN decision, resource, moderator, labels(resource)[0] AS type
          `
        // Wolle console.log('cypher: ', cypher)
        // console.log('disable: ', disable)

        const newDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
          const decisionRelationshipTransactionResponse = await txc.run(cypher, {
            resourceId,
            moderatorId: moderator.id,
            disable,
            closed,
            decisionUUID,
          })
          return decisionRelationshipTransactionResponse.records.map(record => ({
            decision: record.get('decision'),
            resource: record.get('resource'),
            moderator: record.get('moderator'),
            type: record.get('type'),
          }))
        })
        const txResult = await newDecisionWriteTxResultPromise
        if (!txResult[0]) return null
        const { decision, resource, moderator: moderatorInResult, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...decision.properties,
          moderator: moderatorInResult.properties,
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
}
