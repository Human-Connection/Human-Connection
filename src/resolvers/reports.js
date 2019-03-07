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
      await session.run(`
        MATCH (author:User {id: $userId})
        MATCH (resource {id: $resourceId})
        CREATE (report:Report $reportData)
        MERGE (resource)<-[:REPORTED]-(report)
        MERGE (report)<-[:REPORTED]-(author)
        RETURN report
        `, {
        resourceId: id,
        userId: user.id,
        reportData
      }
      )
      session.close()

      // TODO: output Report compatible object
      return reportData
    }
  }
}
