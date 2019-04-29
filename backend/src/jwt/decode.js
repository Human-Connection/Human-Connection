import jwt from 'jsonwebtoken'

export default async (driver, authorizationHeader) => {
  if (!authorizationHeader) return null
  const token = authorizationHeader.replace('Bearer ', '')
  let id = null
  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    id = decoded.sub
  } catch (e) {
    return null
  }
  const session = driver.session()
  const query = `
    MATCH (user:User {id: {id} })
    RETURN user {.id, .slug, .name, .avatar, .email, .role, .disabled, .actorId}
    LIMIT 1
  `
  const result = await session.run(query, { id })
  session.close()
  const [currentUser] = await result.records.map((record) => {
    return record.get('user')
  })
  if (!currentUser) return null
  if (currentUser.disabled) return null
  return {
    token,
    ...currentUser
  }
}
