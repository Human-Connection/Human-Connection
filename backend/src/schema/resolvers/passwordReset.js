import uuid from 'uuid/v4'
import bcrypt from 'bcryptjs'

export async function createPasswordReset(options) {
  const { driver, nonce, email, issuedAt = new Date() } = options
  const session = driver.session()
  let response = {}
  try {
    const cypher = `
      MATCH (u:User)-[:PRIMARY_EMAIL]->(e:EmailAddress {email:$email})
      CREATE(pr:PasswordReset {nonce: $nonce, issuedAt: datetime($issuedAt), usedAt: NULL})
      MERGE (u)-[:REQUESTED]->(pr)
      RETURN e, pr, u
      `
    const transactionRes = await session.run(cypher, {
      issuedAt: issuedAt.toISOString(),
      nonce,
      email,
    })
    const records = transactionRes.records.map(record => {
      const { email } = record.get('e').properties
      const { nonce } = record.get('pr').properties
      const { name } = record.get('u').properties
      return { email, nonce, name }
    })
    response = records[0] || {}
  } finally {
    session.close()
  }
  return response
}

export default {
  Mutation: {
    requestPasswordReset: async (_parent, { email }, { driver }) => {
      const nonce = uuid().substring(0, 6)
      return createPasswordReset({ driver, nonce, email })
    },
    resetPassword: async (_parent, { email, nonce, newPassword }, { driver }) => {
      const session = driver.session()
      const stillValid = new Date()
      stillValid.setDate(stillValid.getDate() - 1)
      const encryptedNewPassword = await bcrypt.hashSync(newPassword, 10)
      const cypher = `
      MATCH (pr:PasswordReset {nonce: $nonce})
      MATCH (e:EmailAddress {email: $email})<-[:PRIMARY_EMAIL]-(u:User)-[:REQUESTED]->(pr)
      WHERE duration.between(pr.issuedAt, datetime()).days <= 0 AND pr.usedAt IS NULL
      SET pr.usedAt = datetime()
      SET u.encryptedPassword = $encryptedNewPassword
      RETURN pr
      `
      const transactionRes = await session.run(cypher, {
        stillValid,
        email,
        nonce,
        encryptedNewPassword,
      })
      const [reset] = transactionRes.records.map(record => record.get('pr'))
      const response = !!(reset && reset.properties.usedAt)
      session.close()
      return response
    },
  },
}
