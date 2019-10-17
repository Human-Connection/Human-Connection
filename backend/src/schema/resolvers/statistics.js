export default {
  Query: {
    statistics: async (parent, args, { driver, user }) => {
      const session = driver.session()
      const response = {}
      try {
        const mapping = {
          countUsers: 'User',
          countPosts: 'Post',
          countComments: 'Comment',
          countNotifications: 'NOTIFIED',
          countEmails: 'EmailAddress',
          countFollows: 'FOLLOWS',
          countShouts: 'SHOUTED',
        }
        const cypher = `
          CALL apoc.meta.stats() YIELD labels, relTypesCount
          RETURN labels, relTypesCount
        `
        const result = await session.run(cypher)
        const [statistics] = await result.records.map(record => {
          return {
            ...record.get('labels'),
            ...record.get('relTypesCount'),
          }
        })
        Object.keys(mapping).forEach(key => {
          const stat = statistics[mapping[key]]
          response[key] = stat ? stat.toNumber() : 0
        })

        /*
         * Note: invites count is calculated this way because invitation codes are not in use yet
         */
        response.countInvites = response.countEmails - response.countUsers
      } finally {
        session.close()
      }
      return response
    },
  },
}
