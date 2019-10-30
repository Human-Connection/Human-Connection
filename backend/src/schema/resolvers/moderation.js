export default {
  Mutation: {
    disable: async (object, params, { user, driver }) => {
      const { id: resourceId } = params
      const { id: userId } = user
      const cypher = `
        MATCH (u:User {id: $userId})
        MATCH (resource {id: $resourceId})
        WHERE resource:User OR resource:Comment OR resource:Post
        SET resource.disabled = true
        MERGE (resource)<-[decision:DECIDED]-(u)
        SET (
        CASE
        WHEN decision.createdAt IS NOT NULL
        THEN decision END).updatedAt = toString(datetime())
        SET (
        CASE
        WHEN decision.createdAt IS NULL
        THEN decision END).createdAt = toString(datetime())
        SET decision.disabled = true, decision.closed = false, decision.last = true
        RETURN resource {.id}
      `
      const session = driver.session()
      const res = await session.run(cypher, { resourceId, userId })
      session.close()
      const [resource] = res.records.map(record => {
        return record.get('resource')
      })
      if (!resource) return null
      return resource.id
    },
    enable: async (object, params, { user, driver }) => {
      const { id: resourceId } = params
      const cypher = `
        MATCH (resource {id: $resourceId})<-[decision:DECIDED]-(:User)
        SET resource.disabled = false
        SET decision.disabled = false, decision.updatedAt = toString(datetime())
        RETURN resource {.id}
      `
      // Wolle
      // DELETE decision

      const session = driver.session()
      const res = await session.run(cypher, { resourceId })
      session.close()
      const [resource] = res.records.map(record => {
        return record.get('resource')
      })
      if (!resource) return null
      return resource.id
    },
    decide: async (object, params, context, _resolveInfo) => {
      let createdRelationshipWithNestedAttributes = null
      const { resourceId, disabled, closed } = params
      const { user: moderator, driver } = context

      const session = driver.session()

      const existingDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
        const decisionRelationshipTransactionResponse = await txc.run(
          `
            MATCH (moderator:User)-[decision:DECIDED {closed: false}]->(resource {id: $resourceId})
            WHERE resource:User OR resource:Comment OR resource:Post
            RETURN decision, moderator {.id} AS decisionModerator
          `, { resourceId },
        )
        return decisionRelationshipTransactionResponse.records.map(record => ({
          decision: record.get('decision'),
          decisionModerator: record.get('decisionModerator'),
        }))
      })

      try {
        const cypherHeader = ''

        // is there an open decision?
        const [existingDecisionTxResult] = await existingDecisionWriteTxResultPromise
        if (!existingDecisionTxResult) {
          // no open decision, then create one
          if (!disabled) disabled = false // default for creation
          if (!disabled) closed = false // default for creation
          cypherHeader = `
            MATCH (moderator:User {id: $moderatorId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Comment OR resource:Post
            CREATE (resource)<-[decision:DECIDED]-(moderator)
            SET decision.last = true
            OPTIONAL MATCH (:User)-[lastDecision:DECIDED {last: true}]->(resource)
            SET (
            CASE
            WHEN lastDecision IS NOT NULL
            THEN lastDecision END).last = false
          `
        } else {
          // an open decision …

          if (!disabled) disabled = existingDecisionTxResult.decision.properties.disabled // default set to existing
          if (!disabled) closed = existingDecisionTxResult.decision.properties.closed // default set to existing
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

        const newDecisionWriteTxResultPromise = session.writeTransaction(async txc => {
          const decisionRelationshipTransactionResponse = await txc.run(
            cypherHeader + `
              SET (
              CASE
              WHEN decision.createdAt IS NOT NULL
              THEN decision END).updatedAt = toString(datetime())
              SET (
              CASE
              WHEN decision.createdAt IS NULL
              THEN decision END).createdAt = toString(datetime())
              SET decision.disabled = $disabled, decision.closed = $closed
              SET resource.disabled = $disabled
              RETURN decision, resource, moderator, labels(resource)[0] AS type
            `, {
              resourceId,
              moderatorId: moderator.id,
              disabled,
              closed,
            },
          )
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
