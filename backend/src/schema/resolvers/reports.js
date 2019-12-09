const transformReturnType = record => {
  return {
    ...record.get('report').properties,
    resource: {
      __typename: record.get('type'),
      ...record.get('resource').properties,
    },
  }
}

export default {
  Mutation: {
    fileReport: async (_parent, params, context, _resolveInfo) => {
      let createdRelationshipWithNestedAttributes
      const { resourceId, reasonCategory, reasonDescription } = params
      const { driver, user } = context
      const session = driver.session()
      const reportWriteTxResultPromise = session.writeTransaction(async txc => {
        const reportTransactionResponse = await txc.run(
          `
            MATCH (submitter:User {id: $submitterId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Post OR resource:Comment
            MERGE (resource)<-[:BELONGS_TO]-(report:Report {closed: false})
            ON CREATE SET report.id = randomUUID(), report.createdAt = $createdAt, report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.disable = resource.disabled, report.closed = false
            WITH submitter, resource, report
            CREATE (report)<-[filed:FILED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)

            RETURN report, resource, labels(resource)[0] AS type
          `,
          {
            resourceId,
            submitterId: user.id,
            createdAt: new Date().toISOString(),
            reasonCategory,
            reasonDescription,
          },
        )
        return reportTransactionResponse.records.map(transformReturnType)
      })
      try {
        const txResult = await reportWriteTxResultPromise
        if (!txResult[0]) return null
        createdRelationshipWithNestedAttributes = txResult[0]
      } finally {
        session.close()
      }
      return createdRelationshipWithNestedAttributes
    },
  },
  Query: {
    reports: async (_parent, params, context, _resolveInfo) => {
      const { driver } = context
      const session = driver.session()
      let reports, orderByClause, filterClause
      switch (params.orderBy) {
        case 'createdAt_asc':
          orderByClause = 'ORDER BY report.createdAt ASC'
          break
        case 'createdAt_desc':
          orderByClause = 'ORDER BY report.createdAt DESC'
          break
        default:
          orderByClause = ''
      }

      switch (params.reviewed) {
        case true:
          filterClause = 'AND ((report)<-[:REVIEWED]-(:User))'
          break
        case false:
          filterClause = 'AND NOT ((report)<-[:REVIEWED]-(:User))'
          break
        default:
          filterClause = ''
      }

      if (params.closed) filterClause = 'AND report.closed = true'

      const offset =
        params.offset && typeof params.offset === 'number' ? `SKIP ${params.offset}` : ''
      const limit = params.first && typeof params.first === 'number' ? `LIMIT ${params.first}` : ''

      const reportReadTxPromise = session.readTransaction(async tx => {
        const allReportsTransactionResponse = await tx.run(
          `
            MATCH (report:Report)-[:BELONGS_TO]->(resource)
            WHERE (resource:User OR resource:Post OR resource:Comment)
            ${filterClause}
            WITH report, resource,
            [(submitter:User)-[filed:FILED]->(report) |  filed {.*, submitter: properties(submitter)} ] as filed,
            [(moderator:User)-[reviewed:REVIEWED]->(report) |  reviewed {.*, moderator: properties(moderator)} ] as reviewed,
            [(resource)<-[:WROTE]-(author:User) | author {.*} ] as optionalAuthors,
            [(resource)-[:COMMENTS]->(post:Post) | post {.*} ] as optionalCommentedPosts,
            resource {.*, __typename: labels(resource)[0] } as resourceWithType
            WITH report, optionalAuthors, optionalCommentedPosts, reviewed, filed,
            resourceWithType {.*, post: optionalCommentedPosts[0], author: optionalAuthors[0] } as finalResource
            RETURN report {.*, resource: finalResource, filed: filed, reviewed: reviewed }
            ${orderByClause}
            ${offset} ${limit}
          `,
        )
        return allReportsTransactionResponse.records.map(record => record.get('report'))
      })
      try {
        const txResult = await reportReadTxPromise
        if (!txResult[0]) return null
        reports = txResult
      } finally {
        session.close()
      }
      return reports
    },
  },
  Report: {
    filed: async (parent, _params, context, _resolveInfo) => {
      if (typeof parent.filed !== 'undefined') return parent.filed
      const session = context.driver.session()
      const { id } = parent
      let filed
      const readTxPromise = session.readTransaction(async tx => {
        const allReportsTransactionResponse = await tx.run(
          `
          MATCH (submitter:User)-[filed:FILED]->(report:Report {id: $id})
          RETURN filed, submitter
          `,
          { id },
        )
        return allReportsTransactionResponse.records.map(record => ({
          submitter: record.get('submitter').properties,
          filed: record.get('filed').properties,
        }))
      })
      try {
        const txResult = await readTxPromise
        if (!txResult[0]) return null
        filed = txResult.map(reportedRecord => {
          const { submitter, filed } = reportedRecord
          const relationshipWithNestedAttributes = {
            ...filed,
            submitter,
          }
          return relationshipWithNestedAttributes
        })
      } finally {
        session.close()
      }
      return filed
    },
    reviewed: async (parent, _params, context, _resolveInfo) => {
      if (typeof parent.reviewed !== 'undefined') return parent.reviewed
      const session = context.driver.session()
      const { id } = parent
      let reviewed
      const readTxPromise = session.readTransaction(async tx => {
        const allReportsTransactionResponse = await tx.run(
          `
            MATCH (resource)<-[:BELONGS_TO]-(report:Report {id: $id})<-[review:REVIEWED]-(moderator:User)
            RETURN moderator, review
            ORDER BY report.updatedAt DESC, review.updatedAt DESC
          `,
          { id },
        )
        return allReportsTransactionResponse.records.map(record => ({
          review: record.get('review').properties,
          moderator: record.get('moderator').properties,
        }))
      })
      try {
        const txResult = await readTxPromise
        reviewed = txResult.map(reportedRecord => {
          const { review, moderator } = reportedRecord
          const relationshipWithNestedAttributes = {
            ...review,
            moderator,
          }
          return relationshipWithNestedAttributes
        })
      } finally {
        session.close()
      }
      return reviewed
    },
  },
}
