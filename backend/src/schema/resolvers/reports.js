import uuid from 'uuid/v4'
import { UserInputError } from 'apollo-server'

const REPORT_USER_ERR_MESSAGE = 'User is already reported by you!'
const REPORT_CONTRIBUTION_MESSAGE = 'Contribution is already reported by you!'
const REPORT_COMMENT_MESSAGE = 'Comment is already reported by you!'

export default {
  Mutation: {
    report: async (parent, { id, description }, { driver, req, user }, resolveInfo) => {
      const reportId = uuid()
      const session = driver.session()
      const reportData = {
        id: reportId,
        createdAt: new Date().toISOString(),
        description: description,
      }
      console.log('-----------------------------------')
      console.log(id)
      const isType = id[0]
      const reportQueryRes = await session.run(
        `
        match (u:User {id:$submitterId}) -[:REPORTED]->(report)-[:REPORTED]-> (resource {id: $resourceId}) 
        return  report, labels(resource)[0] as type
        `,
        {
          resourceId: id,
          submitterId: user.id,
        },
      )
      const [rep] = reportQueryRes.records.map(record => {
        return {
          report: record.get('report'),
          type: record.get('type'),
        }
      })

      if (rep) {
        console.log(rep.type)
        switch (rep.type) {
          case 'User':
            throw new UserInputError(REPORT_USER_ERR_MESSAGE)
            // throw new Error(REPORT_USER_ERR_MESSAGE)
            break
          case 'Post':
            throw new UserInputError(REPORT_CONTRIBUTION_MESSAGE)
            break
          case 'Comment':
            throw new UserInputError(REPORT_COMMENT_MESSAGE)
            break
        }

        session.close()
        return rep
      }
      const res = await session.run(
        `
        MATCH (submitter:User {id: $userId})
        MATCH (resource {id: $resourceId})
        WHERE resource:User OR resource:Comment OR resource:Post
        MERGE (report:Report  {id: {reportData}.id })
        MERGE (resource)<-[:REPORTED]-(report)
        MERGE (report)<-[:REPORTED]-(submitter)
        RETURN report, submitter, resource, labels(resource)[0] as type
        `,
        {
          resourceId: id,
          userId: user.id,
          reportData,
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

      let response = {
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
