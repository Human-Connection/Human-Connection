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
            WHERE resource:User OR resource:Comment OR resource:Post
            CREATE (resource)<-[report:REPORTED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)
            RETURN report, submitter, resource, labels(resource)[0] as type
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
          report: record.get('report'),
          submitter: record.get('submitter'),
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        const { report, submitter, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...report.properties,
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
          MATCH (submitter:User)-[report:REPORTED]->(resource)
          WHERE resource:User OR resource:Comment OR resource:Post
          RETURN report, submitter, resource, labels(resource)[0] as type
          ${orderByClause}
        `
        const result = await session.run(cypher, {})
        const dbResponse = result.records.map(r => {
          return {
            report: r.get('report'),
            submitter: r.get('submitter'),
            resource: r.get('resource'),
            type: r.get('type'),
          }
        })
        if (!dbResponse) return null

        response = []
        dbResponse.forEach(ele => {
          const { report, submitter, resource, type } = ele

          const responseEle = {
            ...report.properties,
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
