import { undefinedToNullResolver } from './helpers/Resolver'

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
            // no open caseFolder, create one
            MERGE (resource)<-[:FLAGGED]-(caseFolder:CaseFolder {closed: false})
            ON CREATE SET caseFolder.id = randomUUID(), caseFolder.createdAt = $createdAt, caseFolder.updatedAt = caseFolder.createdAt, caseFolder.disable = false, caseFolder.closed = false
            // Create report on caseFolder
            WITH submitter, resource, caseFolder
            CREATE (caseFolder)<-[report:REPORTED {createdAt: $createdAt, reasonCategory: $reasonCategory, reasonDescription: $reasonDescription}]-(submitter)

            RETURN submitter, report, caseFolder {.id}, resource, labels(resource)[0] AS type
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
          caseFolder: record.get('caseFolder'),
          resource: record.get('resource').properties,
          type: record.get('type'),
        }))
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        const { submitter, report, caseFolder, resource, type } = txResult[0]
        createdRelationshipWithNestedAttributes = {
          ...report.properties,
          caseFolderId: caseFolder.id,
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
          MATCH (submitter:User)-[report:REPORTED]->(caseFolder:CaseFolder)-[:FLAGGED]->(resource)
          // Wolle OPTIONAL MATCH (reviewer:User)-[:REVIEWED]->(caseFolder)
          WHERE resource:User OR resource:Post OR resource:Comment
          RETURN submitter, report, caseFolder, resource, labels(resource)[0] as type
          ${orderByClause}
        `
        const result = await session.run(cypher, {})
        const dbResponse = result.records.map(r => {
          return {
            submitter: r.get('submitter'),
            report: r.get('report'),
            caseFolder: r.get('caseFolder'),
            resource: r.get('resource'),
            type: r.get('type'),
          }
        })
        if (!dbResponse) return null

        response = []
        dbResponse.forEach(ele => {
          const { report, submitter, caseFolder, resource, type, decision, decisionPending } = ele

          const responseEle = {
            ...report.properties,
            caseFolderId: caseFolder.id,
            caseFolderUpdatedAt: caseFolder.updatedAt,
            caseFolderDisable: caseFolder.disable,
            caseFolderClosed: caseFolder.closed,
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

      // Wolle console.log('response: ')
      // response.forEach((ele, index) => {
      //   // console.log('ele #', index, ': ', ele)
      //   // if (ele.decision === undefined)
      //   // console.log('ele #', index, ': ', ele)
      //   if (ele.decision) console.log('ele #', index, ': ', ele)
      // })
      // // Wolle console.log('response: ', response)

      return response
    },
  },
  REPORTED: {
    // Wolle ...undefinedToNullResolver(['decisionUuid', 'decisionAt', 'decisionDisable']),
  },
}
