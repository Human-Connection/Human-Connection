
import jwt from 'jsonwebtoken'
import ms from 'ms'

// Generate an Access Token for the given User ID
export default function encode (user) {
  const token = jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: ms('1d'),
    issuer: process.env.GRAPHQL_URI,
    audience: process.env.CLIENT_URI,
    subject: user.id.toString()
  })
  // jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
  //   console.log('token verification:', err, data)
  // })
  return token
}
