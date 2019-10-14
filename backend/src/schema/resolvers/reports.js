export default {
  Mutation: {
    report: async (_parent, params, { driver, user }, _resolveInfo) => {
      const { resourceId, reasonCategory, reasonDescription } = params

      const session = driver.session()
      const reportProperties = {
        createdAt: new Date().toISOString(),
        reasonCategory,
        reasonDescription,
      }

      const reportQueryRes = await session.run(
        `
          MATCH (:User {id:$submitterId})-[:REPORTED]->(resource {id:$resourceId}) 
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
          MATCH (submitter:User {id: $submitterId})
          MATCH (resource {id: $resourceId})
          WHERE resource:User OR resource:Comment OR resource:Post
          CREATE (resource)<-[report:REPORTED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)
          RETURN report, submitter, resource, labels(resource)[0] as type
        `,
        {
          resourceId,
          submitterId: user.id,
          createdAt: reportProperties.createdAt,
          reasonCategory: reportProperties.reasonCategory,
          reasonDescription: reportProperties.reasonDescription,
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
          resourceId: resource.properties.id,
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
