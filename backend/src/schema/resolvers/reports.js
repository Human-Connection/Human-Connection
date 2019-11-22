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
          submitter: record.get('submitter'),
          report: record.get('report'),
          claim: record.get('claim'),
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        const { submitter, report, claim, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...report.properties,
          claimId: claim.properties.id,
          claimUpdatedAt: claim.properties.updatedAt,
          claimDisable: claim.properties.disable,
          claimClosed: claim.properties.closed,
          post: null,
          comment: null,
          user: null,
          submitter: submitter.properties,
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
      let response
      let orderByClause
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
      try {
        const cypher = `
          MATCH (submitter:User)-[report:REPORTED]->(claim:Claim)-[:BELONGS_TO]->(resource)
          WHERE resource:User OR resource:Post OR resource:Comment
          RETURN submitter, report, claim, resource, labels(resource)[0] as type
          ${orderByClause}
        `
        const result = await session.run(cypher, {})
        const dbResponse = result.records.map(r => {
          return {
            submitter: r.get('submitter'),
            report: r.get('report'),
            claim: r.get('claim'),
            resource: r.get('resource'),
            type: r.get('type'),
          }
        })
        if (!dbResponse) return null

        response = []
        dbResponse.forEach(ele => {
          const { report, submitter, claim, resource, type } = ele

          const responseEle = {
            ...report.properties,
            claimId: claim.properties.id,
            claimUpdatedAt: claim.properties.updatedAt,
            claimDisable: claim.properties.disable,
            claimClosed: claim.properties.closed,
            post: null,
            comment: null,
            user: null,
            submitter: submitter.properties,
            type,
          }

          switch (type) {
            case 'Post':
              responseEle.post = resource.properties
              break
            case 'Comment':
              responseEle.comment = resource.properties
              break
            case 'User':
              responseEle.user = resource.properties
              break
          }
          response.push(responseEle)
        })
      } finally {
        session.close()
      }

      return response
    },
  },
}
