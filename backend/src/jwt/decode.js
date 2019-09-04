import jwt from 'jsonwebtoken'
import CONFIG from './../config'

export default async (driver, authorizationHeader) => {
  if (!authorizationHeader) return null
  const token = authorizationHeader.replace('Bearer ', '')
  let id = null
  try {
    const decoded = await jwt.verify(token, CONFIG.JWT_SECRET)
    id = decoded.sub
  } catch (err) {
    return null
  }
  const session = driver.session()
  const query = `
    MATCH (user:User {id: $id, deleted: false, disabled: false })
    RETURN user {.id, .slug, .name, .avatar, .email, .role, .disabled, .actorId}
    LIMIT 1
  `
  const result = await session.run(query, { id })
  session.close()
  const [currentUser] = await result.records.map(record => {
    return record.get('user')
  })
  if (!currentUser) return null
  return {
    token,
    ...currentUser,
  }
}
