import uuid from 'uuid/v4'

export default {
  Mutation: {
    report: async (parent, { id, description }, { driver, req, user }, resolveInfo) => {
      const reportId = uuid()
      const session = driver.session()
      const reportData = {
        id: reportId,
        createdAt: (new Date()).toISOString(),
        description: description
      }

      const res = await session.run(`
        MATCH (author:User {id: $userId})
        MATCH (resource {id: $resourceId})
        CREATE (report:Report $reportData)
        MERGE (resource)<-[:REPORTED]-(report)
        MERGE (report)<-[:REPORTED]-(author)
        RETURN report, author, resource
        `, {
        resourceId: id,
        userId: user.id,
        reportData
      }
      )
      const [{ report, author, resource }] = res.records.map(r => {
        return {
          report: r.get('report'),
          author: r.get('author'),
          resource: r.get('resource')
        }
      })
      session.close()
      console.log(report)
      console.log(author)

      // TODO: output Report compatible object
      return {
        ...report.properties,
        reporter: author.properties,
        user: resource.properties,
        type: 'blablabla'
      }
    }
  }
}
