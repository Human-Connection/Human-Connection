export default {
  Query: {
    userData: async (object, args, context, resolveInfo) => {
      const id = context.user.id
      const cypher = `
        MATCH (u:User { id: $id })
        WITH u AS user
        OPTIONAL MATCH (p:Post)
        WHERE (p)<-[:COMMENTS]-(:Comment)<-[:WROTE]-(user)
        OR (user)-[:WROTE]->(p)
        RETURN { user: properties(user), posts: collect(properties(p)) }
        AS result
      `
      const session = context.driver.session()
      const resultPromise = session.readTransaction(async (transaction) => {
        const transactionResponse = transaction.run(cypher, {
          id,
        })
        return transactionResponse
      })

      try {
        const result = await resultPromise
        return result.records[0].get('result')
      } finally {
        session.close()
      }
    },
  },
}
