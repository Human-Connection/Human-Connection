export default {
  Mutation: {
    fileReport: async (_parent, params, context, _resolveInfo) => {
      let createdRelationshipWithNestedAttributes
      const { resourceId, reasonCategory, reasonDescription } = params
      const { driver, user } = context
      const session = driver.session()
      const writeTxResultPromise = session.writeTransaction(async txc => {
        const reportRelationshipTransactionResponse = await txc.run(
          `
            MATCH (submitter:User {id: $submitterId})
            MATCH (resource {id: $resourceId})
            WHERE resource:User OR resource:Post OR resource:Comment
            // no open report, create one
            MERGE (resource)<-[:BELONGS_TO]-(report:Report {closed: false})
            ON CREATE SET report.id = randomUUID(), report.createdAt = $createdAt, report.updatedAt = report.createdAt, report.rule = 'latestReviewUpdatedAtRules', report.disable = resource.disabled, report.closed = false
            // ON MATCH: do not update report.updatedAt !!! that is only for reviews!
            // Create report to report
            WITH submitter, resource, report
            CREATE (report)<-[filed:FILED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)

            RETURN submitter, report, resource, labels(resource)[0] AS type
          `,
          {
            resourceId,
            submitterId: user.id,
            createdAt: new Date().toISOString(),
            reasonCategory,
            reasonDescription,
          },
        )
        return reportRelationshipTransactionResponse.records.map(record => ({
          submitter: record.get('submitter').properties,
          report: record.get('report').properties,
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        const { submitter, report, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...report,
          post: null,
          comment: null,
          user: null,
          submitter,
          type,
        }
        switch (type) {
          case 'Post':
            createdRelationshipWithNestedAttributes.post = resource
            break
          case 'Comment':
            createdRelationshipWithNestedAttributes.comment = resource
            break
          case 'User':
            createdRelationshipWithNestedAttributes.user = resource
            break
        }
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
      let reports, orderByClause
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
      const readTxPromise = session.readTransaction(async tx => {
        const allReportsTransactionResponse = await tx.run(
          `
          MATCH (submitter:User)-[filed:FILED]->(report:Report)-[:BELONGS_TO]->(resource)
          WHERE resource:User OR resource:Post OR resource:Comment
          RETURN submitter, report, resource, labels(resource)[0] as type
          ${orderByClause}
          `,
          {},
        )
        return allReportsTransactionResponse.records.map(record => ({
          submitter: record.get('submitter').properties,
          report: record.get('report').properties,
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await readTxPromise
        if (!txResult[0]) return null
        reports = txResult.map(reportedRecord => {
          const { report, submitter, resource, type } = reportedRecord
          const relationshipWithNestedAttributes = {
            ...report,
            post: null,
            comment: null,
            user: null,
            submitter,
            type,
          }
          switch (type) {
            case 'Post':
              relationshipWithNestedAttributes.post = resource
              break
            case 'Comment':
              relationshipWithNestedAttributes.comment = resource
              break
            case 'User':
              relationshipWithNestedAttributes.user = resource
              break
          }
          return relationshipWithNestedAttributes
        })
      } finally {
        session.close()
      }
      return reports
    },
  },
  Report: {
    reportsFiled: async (parent, _params, context, _resolveInfo) => {
      if (typeof parent.reportsFiled !== 'undefined') return parent.reportsFiled
      const session = context.driver.session()
      const { id } = parent
      let reportsFiled
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
        reportsFiled = txResult.map(reportedRecord => {
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
      return reportsFiled
    },
  },
}
