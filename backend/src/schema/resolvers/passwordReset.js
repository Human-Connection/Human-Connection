import uuid from 'uuid/v4'
import bcrypt from 'bcryptjs'
import createPasswordReset from './helpers/createPasswordReset'

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
