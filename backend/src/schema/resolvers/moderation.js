export default {
  Mutation: {
    review: async (_object, params, context, _resolveInfo) => {
      const { resourceId } = params
      let { disable, closed } = params
      // Wolle console.log('disable: ', disable)
      // console.log('closed: ', closed)
      disable = disable === undefined ? null : disable
      closed = closed === undefined ? null : closed
      // Wolle console.log('disable: ', disable)
      // console.log('closed: ', closed)
      const { user: moderator, driver } = context

      let createdRelationshipWithNestedAttributes = null // return value

      const session = driver.session()
      try {
        const cypher = ` 
            MATCH (moderator:User {id: $moderatorId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Post OR resource:Comment

            // no open claim, create one, update existing
            MERGE (resource)<-[:BELONGS_TO]-(claim:Claim {closed: false})
            ON CREATE SET claim.id = randomUUID(), claim.createdAt = $dateTime, claim.updatedAt = claim.createdAt, claim.rule = 'latestReviewUpdatedAtRules', claim.disable = resource.disabled, claim.closed = false
            ON MATCH SET claim.updatedAt = $dateTime
            // claim.disable and claim.closed are set after setting them in review

            // Create review on claim
            WITH moderator, resource, claim
            MERGE (claim)<-[review:REVIEWED]-(moderator)
            ON CREATE SET review.createdAt = $dateTime, review.updatedAt = review.createdAt,
              review.disable = CASE WHEN $disable IS NULL
                THEN claim.disable
                ELSE $disable END,
              review.closed = CASE WHEN $closed IS NULL
                THEN claim.closed
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

            RETURN moderator, review, claim, resource, labels(resource)[0] AS type
          `
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
        const { moderator: moderatorInResult, review, claim, resource, type } = txResult[0]
        // Wolle console.log('review.properties.disable: ', review.properties.disable)
        // console.log('claim.properties.disable: ', claim.properties.disable)
        // console.log('resource.properties.disabled: ', resource.properties.disabled)
        // console.log('review.properties.closed: ', review.properties.closed)
        // console.log('claim.properties.closed: ', claim.properties.closed)
        createdRelationshipWithNestedAttributes = {
          ...review.properties,
          claimId: claim.properties.id,
          claimUpdatedAt: claim.properties.updatedAt,
          claimDisable: claim.properties.disable,
          claimClosed: claim.properties.closed,
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
