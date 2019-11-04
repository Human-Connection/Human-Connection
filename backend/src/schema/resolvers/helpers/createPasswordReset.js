import { normalizeEmail } from 'validator'

export default async function createPasswordReset(options) {
  const { driver, nonce, email, issuedAt = new Date() } = options
  const normalizedEmail = normalizeEmail(email)
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
      email: normalizedEmail,
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
