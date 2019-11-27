const transformReturnType = record => {
  return {
    ...record.get('review').properties,
    report: record.get('report').properties,
    to: {
      __typename: record.get('type'),
      ...record.get('resource').properties,
    },
  }
}

export default {
  Mutation: {
    review: async (_object, params, context, _resolveInfo) => {
      const { user: moderator, driver } = context

      let createdRelationshipWithNestedAttributes = null // return value
      const session = driver.session()
      try {
        const cypher = ` 
            MATCH (resource {id: $params.resourceId})<-[:BELONGS_TO]-(report:Report {closed: false})
            MATCH (moderator:User {id: $moderatorId})
            WHERE resource:User OR resource:Post OR resource:Comment
            MERGE (report)<-[review:REVIEWED { disable: $params.disable, closed: $params.closed }]-(moderator)
            ON CREATE SET review.createdAt = $dateTime, review.updatedAt = review.createdAt
            ON MATCH SET review.updatedAt = $dateTime
            SET report.updatedAt = $dateTime, report.closed = review.closed
            SET resource.disabled = review.disable

            RETURN review, report, resource, labels(resource)[0] AS type
          `
        const reviewWriteTxResultPromise = session.writeTransaction(async txc => {
          const reviewTransactionResponse = await txc.run(cypher, {
            params,
            moderatorId: moderator.id,
            dateTime: new Date().toISOString(),
          })
          return reviewTransactionResponse.records.map(transformReturnType)
        })
        const txResult = await reviewWriteTxResultPromise
        if (!txResult[0]) return null
        createdRelationshipWithNestedAttributes = txResult[0]
      } finally {
        session.close()
      }

      return createdRelationshipWithNestedAttributes
    },
  },
}
