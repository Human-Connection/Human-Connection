import uuid from 'uuid/v4'

export default {
  Mutation: {
    report: async (_parent, { resourceId, reasonCategory, reasonDescription }, { driver, req, user }, _resolveInfo) => {
      const reportId = uuid()
      const session = driver.session()
      const reportProperties = {
        id: reportId,
        createdAt: new Date().toISOString(),
        reasonCategory,
        reasonDescription,
      }

      const reportQueryRes = await session.run(
        `
          MATCH (u:User {id:$submitterId})-[:REPORTED]->(report)-[:REPORTED]->(resource {id: $resourceId}) 
          RETURN labels(resource)[0] as label
        `,
        {
          resourceId,
          submitterId: user.id,
        },
      )
      const [rep] = reportQueryRes.records.map(record => {
        return {
          label: record.get('label'),
        }
      })

      if (rep) {
        throw new Error(rep.label)
      }

      const res = await session.run(
        `
          MATCH (submitter:User {id: $userId})
          MATCH (resource {id: $resourceId})
          WHERE resource:User OR resource:Comment OR resource:Post
          CREATE (report:Report  {reportProperties})
          MERGE (resource)<-[:REPORTED]-(report)
          MERGE (report)<-[:REPORTED]-(submitter)
          RETURN report, submitter, resource, labels(resource)[0] as type
        `,
        {
          resourceId,
          userId: user.id,
          reportProperties,
        },
      )

      session.close()

      const [dbResponse] = res.records.map(r => {
        return {
          report: r.get('report'),
          submitter: r.get('submitter'),
          resource: r.get('resource'),
          type: r.get('type'),
        }
      })
      if (!dbResponse) return null
      const { report, submitter, resource, type } = dbResponse

      const response = {
        ...report.properties,
        post: null,
        comment: null,
        user: null,
        submitter: submitter.properties,
        type,
      }
      switch (type) {
        case 'Post':
          response.post = resource.properties
          break
        case 'Comment':
          response.comment = resource.properties
          break
        case 'User':
          response.user = resource.properties
          break
      }

      return response
    },
  },
}
