import uuid from 'uuid/v4'
import bcrypt from 'bcryptjs'

export async function createPasswordReset({ driver, token, email, validUntil }) {
  const session = driver.session()
  const cypher = `
      MATCH (u:User) WHERE u.email = $email
      CREATE(pr:PasswordReset {token: $token, validUntil: $validUntil, redeemedAt: NULL})
      MERGE (u)-[:REQUESTED]->(pr)
      RETURN u,pr
      `
  const transactionRes = await session.run(cypher, { token, email, validUntil })
  const resets = transactionRes.records.map(record => record.get('pr'))
  session.close()
  return resets
}

export default {
  Mutation: {
    requestPasswordReset: async (_, { email }, { driver }) => {
      let validUntil = new Date()
      validUntil += 3 * 60 * 1000
      const token = uuid()
      await createPasswordReset({ driver, token, email, validUntil })
      return true
    },
    resetPassword: async (_, { email, token, newPassword }, { driver }) => {
      const session = driver.session()
      const now = new Date().getTime()
      const newHashedPassword = await bcrypt.hashSync(newPassword, 10)
      const cypher = `
      MATCH (r:PasswordReset {token: $token})
      MATCH (u:User {email: $email})-[:REQUESTED]->(r)
      WHERE r.validUntil > $now AND r.redeemedAt IS NULL
      SET r.redeemedAt = $now
      SET u.password = $newHashedPassword
      RETURN r
      `
      let transactionRes = await session.run(cypher, { now, email, token, newHashedPassword })
      const [reset] = transactionRes.records.map(record => record.get('r'))
      const result = !!(reset && reset.properties.redeemedAt)
      session.close()
      return result
    },
  },
}
