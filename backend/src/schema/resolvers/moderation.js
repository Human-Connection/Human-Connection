export default {
  Mutation: {
    review: async (_object, params, context, _resolveInfo) => {
      const { resourceId } = params
      let { disable, closed } = params
      disable = disable === undefined ? null : disable
      closed = closed === undefined ? null : closed
      const { user: moderator, driver } = context

      let createdRelationshipWithNestedAttributes = null // return value

      const session = driver.session()
      try {
        const cypher = ` 
            MATCH (moderator:User {id: $moderatorId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Post OR resource:Comment

            // no open report, create one, update existing
            MERGE (resource)<-[:BELONGS_TO]-(report:Report {closed: false})
            ON CREATE SET report.id = randomUUID(), report.createdAt = $dateTime, report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.disable = resource.disabled, report.closed = false
            ON MATCH SET report.updatedAt = $dateTime
            // report.disable and report.closed are set after setting them in review

            // Create review on report
            WITH moderator, resource, report
            MERGE (report)<-[review:REVIEWED]-(moderator)
            ON CREATE SET review.createdAt = $dateTime, review.updatedAt = review.createdAt,
              review.disable = CASE WHEN $disable IS NULL
                THEN report.disable
                ELSE $disable END,
              review.closed = CASE WHEN $closed IS NULL
                THEN report.closed
                ELSE $closed END
            ON MATCH SET
              review.updatedAt = $dateTime,
              review.disable = CASE WHEN $disable IS NULL
                THEN review.disable
                ELSE $disable END,
              review.closed = CASE WHEN $closed IS NULL
                THEN review.closed
                ELSE $closed END

            SET report.disable = review.disable, report.closed = review.closed
            SET resource.disabled = review.disable

            RETURN moderator, review, report, resource, labels(resource)[0] AS type
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
            report: record.get('report'),
            resource: record.get('resource'),
            type: record.get('type'),
          }))
        })
        const txResult = await mutateDecisionWriteTxResultPromise
        if (!txResult[0]) return null
        const { moderator: moderatorInResult, review, report, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...review.properties,
          reportId: report.properties.id,
          reportCreatedAt: report.properties.createdAt,
          reportUpdatedAt: report.properties.updatedAt,
          reportDisable: report.properties.disable,
          reportClosed: report.properties.closed,
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
