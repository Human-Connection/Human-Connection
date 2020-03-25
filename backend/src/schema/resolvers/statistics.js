import log from './helpers/databaseLogger'

export default {
  Query: {
    statistics: async (_parent, _args, { driver }) => {
      const session = driver.session()
      const counts = {}
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
        const statisticsReadTxResultPromise = session.readTransaction(async (transaction) => {
          const statisticsTransactionResponse = await transaction.run(
            `
              CALL apoc.meta.stats() YIELD labels, relTypesCount
              RETURN labels, relTypesCount
            `,
          )
          log(statisticsTransactionResponse)
          return statisticsTransactionResponse.records.map((record) => {
            return {
              ...record.get('labels'),
              ...record.get('relTypesCount'),
            }
          })
        })
        const [statistics] = await statisticsReadTxResultPromise
        Object.keys(mapping).forEach((key) => {
          const stat = statistics[mapping[key]]
          counts[key] = stat ? stat.toNumber() : 0
        })
        counts.countInvites = counts.countEmails - counts.countUsers
        return counts
      } finally {
        session.close()
      }
    },
  },
}
