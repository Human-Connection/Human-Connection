import { UserInputError } from 'apollo-server'

export default async function alreadyExistingMail({ args, context, throwOnExisting = true }) {
  const session = context.driver.session()
  try {
    const existingEmailAddressTxPromise = session.writeTransaction(async (transaction) => {
      const existingEmailAddressTransactionResponse = await transaction.run(
        `
          MATCH (email:EmailAddress {email: $email})
          OPTIONAL MATCH (email)-[:BELONGS_TO]-(user)
          RETURN email, user
        `,
        { email: args.email },
      )
      return existingEmailAddressTransactionResponse.records.map((record) => {
        return {
          alreadyExistingEmail: record.get('email').properties,
          user: record.get('user') && record.get('user').properties,
        }
      })
    })
    const [emailBelongsToUser] = await existingEmailAddressTxPromise
    const { alreadyExistingEmail, user } = emailBelongsToUser || {}
    if (user) {
      if (throwOnExisting) {
        throw new UserInputError('A user account with this email already exists.')
      }
      // Return null to indicate email belongs to an existing user (caller should handle gracefully)
      return { alreadyExistingEmail, user, emailTaken: true }
    }
    return { alreadyExistingEmail, user: null, emailTaken: false }
  } finally {
    session.close()
  }
}
