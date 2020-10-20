import normalizeEmail from './normalizeEmail'
import bcrypt from 'bcryptjs'

export default async function passwordReset(options) {
  const { driver, nonce, email } = options
  const normalizedEmail = normalizeEmail(email)
  const encryptedNewPassword = await bcrypt.hashSync(nonce, 10)
  const session = driver.session()
  try {
    const createPasswordResetTxPromise = session.writeTransaction(async (transaction) => {
      const createPasswordResetTransactionResponse = await transaction.run(
        `
          MATCH (user:User)-[r:PRIMARY_EMAIL]->(e:EmailAddress {email: $email})
          SET user.encryptedPassword = $encryptedNewPassword
          SET user.updatedAt = toString(datetime())
          RETURN user
        `,
        {
          email: normalizedEmail,
          encryptedNewPassword: encryptedNewPassword,
        },
      )
      return createPasswordResetTransactionResponse.records.map((record) => {
        const { name } = record.get('user').properties
        return { email, nonce, name }
      })
    })
    const [records] = await createPasswordResetTxPromise
    return records || {}
  } finally {
    session.close()
  }
}
