import { Strategy } from 'passport-jwt'
import { fixUrl } from '../middleware/fixImageUrlsMiddleware'

const cookieExtractor = (req) => {
  var token = null
  if (req && req.cookies) {
    token = req.cookies['jwt']
  }
  return token
}

export default (driver) => {
  const options = {
    jwtFromRequest: cookieExtractor,
    secretOrKey: process.env.JWT_SECRET,
    issuer: process.env.GRAPHQL_URI,
    audience: process.env.CLIENT_URI
  }

  return new Strategy(options,
    async (JWTPayload, next) => {
      const session = driver.session();
      const result = await session.run(
        'MATCH (user:User {id: $userId}) ' +
        'RETURN user {.id, .slug, .name, .avatar, .email, .password, .role} as user LIMIT 1',
        {
          userId: JWTPayload.id
        }
      );
      session.close();
      const [currentUser] = await result.records.map((record) => {
        return record.get("user");
      });

      if (currentUser) {
        delete currentUser.password;
        currentUser.avatar = fixUrl(currentUser.avatar)
        return next(null, currentUser);
      } else {
        return next(null, false);
      }
    })
}
