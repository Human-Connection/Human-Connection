import uuid from 'uuid/v4'
import bcrypt from 'bcryptjs'
import CONFIG from '../../config'
import nodemailer from 'nodemailer'
import { resetPasswordMail, wrongAccountMail } from './passwordReset/emailTemplates'

const transporter = () => {
  const configs = {
    host: CONFIG.SMTP_HOST,
    port: CONFIG.SMTP_PORT,
    ignoreTLS: CONFIG.SMTP_IGNORE_TLS,
    secure: false, // true for 465, false for other ports
  }
  const { SMTP_USERNAME: user, SMTP_PASSWORD: pass } = CONFIG
  if (user && pass) {
    configs.auth = { user, pass }
  }
  return nodemailer.createTransport(configs)
}

export async function createPasswordReset(options) {
  const { driver, code, email, issuedAt = new Date() } = options
  const session = driver.session()
  const cypher = `
      MATCH (u:User) WHERE u.email = $email
      CREATE(pr:PasswordReset {code: $code, issuedAt: datetime($issuedAt), usedAt: NULL})
      MERGE (u)-[:REQUESTED]->(pr)
      RETURN u
      `
  const transactionRes = await session.run(cypher, {
    issuedAt: issuedAt.toISOString(),
    code,
    email,
  })
  const users = transactionRes.records.map(record => record.get('u'))
  session.close()
  return users
}

export default {
  Mutation: {
    requestPasswordReset: async (_, { email }, { driver }) => {
      const code = uuid().substring(0, 6)
      const [user] = await createPasswordReset({ driver, code, email })
      if (CONFIG.SMTP_HOST && CONFIG.SMTP_PORT) {
        const name = (user && user.name) || ''
        const mailTemplate = user ? resetPasswordMail : wrongAccountMail
        await transporter().sendMail(mailTemplate({ email, code, name }))
      }
      return true
    },
    resetPassword: async (_, { email, code, newPassword }, { driver }) => {
      const session = driver.session()
      const stillValid = new Date()
      stillValid.setDate(stillValid.getDate() - 1)
      const newHashedPassword = await bcrypt.hashSync(newPassword, 10)
      const cypher = `
      MATCH (pr:PasswordReset {code: $code})
      MATCH (u:User {email: $email})-[:REQUESTED]->(pr)
      WHERE duration.between(pr.issuedAt, datetime()).days <= 0 AND pr.usedAt IS NULL
      SET pr.usedAt = datetime()
      SET u.password = $newHashedPassword
      RETURN pr
      `
      let transactionRes = await session.run(cypher, { stillValid, email, code, newHashedPassword })
      const [reset] = transactionRes.records.map(record => record.get('pr'))
      const result = !!(reset && reset.properties.usedAt)
      session.close()
      return result
    },
  },
}
