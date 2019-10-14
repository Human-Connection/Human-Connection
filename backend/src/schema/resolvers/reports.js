export default {
  Mutation: {
    report: async (_parent, params, { driver, user }, _resolveInfo) => {
      let createdRelationshipWithNestedAttributes
      const { resourceId, reasonCategory, reasonDescription } = params
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
    reports: async (_parent, _params, { driver }, _resolveInfo) => {
      const session = driver.session()
      const res = await session.run(
        `
          MATCH (submitter:User)-[report:REPORTED]->(resource)
          WHERE resource:User OR resource:Comment OR resource:Post
          RETURN report, submitter, resource, labels(resource)[0] as type
        `,
        {},
      )
      session.close()

      const dbResponse = res.records.map(r => {
        return {
          report: r.get('report'),
          submitter: r.get('submitter'),
          resource: r.get('resource'),
          type: r.get('type'),
        }
      })
      if (!dbResponse) return null

      const response = []
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

      return response
    },
  },
}
