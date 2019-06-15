export default {
  Mutation: {
    requestPasswordReset: async (_, { email }, { driver }) => {
      const session = driver.session()
      let validUntil = new Date()
      validUntil += 3*60*1000
      const cypher = `
      MATCH(u:User) WHERE u.email = $email
      CREATE(pr:PasswordReset {id: apoc.create.uuid(), validUntil: $validUntil, redeemedAt: NULL})
      MERGE (u)-[:REQUESTED]->(pr)
      RETURN u,pr
      `
      await session.run(cypher, { email, validUntil })
      session.close()
      return true
    },
    resetPassword: async (_, { email, token, newPassword }, { driver }) => {
      throw Error('Not Implemented')
    }
  }
}
