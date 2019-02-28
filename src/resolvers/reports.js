import uuid from 'uuid/v4'

export default {
  Mutation: {
    report: async (parent, { resource, description }, { driver, req, user }, resolveInfo) => {
      const contextId = uuid()
      const session = driver.session()
      const data = {
        id: contextId,
        type: resource.type,
        createdAt: (new Date()).toISOString(),
        description: resource.description
      }
      await session.run(
        'CREATE (r:Report $report) ' +
        'RETURN r.id, r.type, r.description', {
          report: data
        }
      )
      let contentType

      switch (resource.type) {
      case 'post':
      case 'contribution':
        contentType = 'Post'
        break
      case 'comment':
        contentType = 'Comment'
        break
      case 'user':
        contentType = 'User'
        break
      }

      await session.run(
        `MATCH (author:User {id: $userId}), (context:${contentType} {id: $resourceId}), (report:Report {id: $contextId}) ` +
        'MERGE (report)<-[:REPORTED]-(author) ' +
        'MERGE (context)<-[:REPORTED]-(report) ' +
        'RETURN context', {
          resourceId: resource.id,
          userId: user.id,
          contextId: contextId
        }
      )
      session.close()

      // TODO: output Report compatible object
      return data
    }
  }
}
