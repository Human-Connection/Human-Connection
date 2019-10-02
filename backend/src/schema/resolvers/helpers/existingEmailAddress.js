import { UserInputError } from 'apollo-server'
export default async function alreadyExistingMail(_parent, args, context) {
  let { email } = args
  email = email.toLowerCase()
  const cypher = `
    MATCH (email:EmailAddress {email: $email})
    OPTIONAL MATCH (email)-[:BELONGS_TO]-(user)
    RETURN email, user
  `
  let transactionRes
  const session = context.driver.session()
  try {
    transactionRes = await session.run(cypher, { email })
  } finally {
    session.close()
  }
  const [result] = transactionRes.records.map(record => {
    return {
      alreadyExistingEmail: record.get('email').properties,
      user: record.get('user') && record.get('user').properties,
    }
  })
  const { alreadyExistingEmail, user } = result || {}
  if (user) throw new UserInputError('A user account with this email already exists.')
  return alreadyExistingEmail
}
