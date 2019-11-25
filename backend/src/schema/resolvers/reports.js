export default {
  Mutation: {
    report: async (_parent, params, context, _resolveInfo) => {
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
            // no open claim, create one
            MERGE (resource)<-[:BELONGS_TO]-(claim:Claim {closed: false})
            ON CREATE SET claim.id = randomUUID(), claim.createdAt = $createdAt, claim.updatedAt = claim.createdAt, claim.rule = 'latestReviewUpdatedAtRules', claim.disable = resource.disabled, claim.closed = false
            // ON MATCH: do not update claim.updatedAt !!! that is only for reviews!
            // Create report to claim
            WITH submitter, resource, claim
            CREATE (claim)<-[report:REPORTED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)

            RETURN submitter, report, claim, resource, labels(resource)[0] AS type
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
          claim: record.get('claim').properties,
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        const { submitter, report, claim, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...report,
          claim,
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
          orderByClause = 'ORDER BY claim.createdAt ASC, report.createdAt DESC'
          break
        case 'createdAt_desc':
          orderByClause = 'ORDER BY claim.createdAt DESC, report.createdAt DESC'
          break
        default:
          orderByClause = ''
      }
      const readTxPromise = session.readTransaction(async tx => {
        const allReportsTransactionResponse = await tx.run(
          `
          MATCH (submitter:User)-[report:REPORTED]->(claim:Claim)-[:BELONGS_TO]->(resource)
          WHERE resource:User OR resource:Post OR resource:Comment
          RETURN submitter, report, claim, resource, labels(resource)[0] as type
          ${orderByClause}
          `,
          {},
        )
        return allReportsTransactionResponse.records.map(record => ({
          submitter: record.get('submitter').properties,
          report: record.get('report').properties,
          claim: record.get('claim').properties,
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await readTxPromise
        if (!txResult[0]) return null
        reports = txResult.map(reportedRecord => {
          const { report, submitter, claim, resource, type } = reportedRecord
          const relationshipWithNestedAttributes = {
            ...report,
            claim,
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
}
