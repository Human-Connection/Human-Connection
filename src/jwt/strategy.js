import { Strategy } from 'passport-jwt'

const cookieExtractor = (req) => {
  var token = null
  if (req && req.cookies) {
    token = req.cookies['jwt']
  }
  return token
}

export default () => {
  const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET,
    issuer: process.env.GRAPHQL_URI,
    audience: process.env.CLIENT_URI
  }

  return new Strategy(options,
    (JWTPayload, next) => {
      console.log('JWT Payload Received:', JWTPayload)
      // usually this would be a database call:
      // var user = users[_.findIndex(users, {id: JWTPayload.id})]
      if (true) {
        next(null, {})
      } else {
        next(null, false)
      }
    })
}
