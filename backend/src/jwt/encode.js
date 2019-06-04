import jwt from 'jsonwebtoken'
import ms from 'ms'
import CONFIG from './../config'

// Generate an Access Token for the given User ID
export default function encode(user) {
  const token = jwt.sign(user, CONFIG.JWT_SECRET, {
    expiresIn: ms('1d'),
    issuer: CONFIG.GRAPHQL_URI,
    audience: CONFIG.CLIENT_URI,
    subject: user.id.toString(),
  })
  // jwt.verifySignature(token, CONFIG.JWT_SECRET, (err, data) => {
  //   console.log('token verification:', err, data)
  // })
  return token
}
