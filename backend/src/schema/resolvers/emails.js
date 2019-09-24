import generateNonce from '../../helpers/generateNonce'
import Resolver from './helpers/Resolver'

export default {
  Mutation: {
    AddEmailAddress: async (_parent, args, context, _resolveInfo) => {
      let response
      const nonce = generateNonce()
      const {
        user: { id: userId },
      } = context
      const { email } = args
      const session = context.driver.session()
      const writeTxResultPromise = session.writeTransaction(async txc => {
        const result = await txc.run(
          `
            MATCH (user:User {id: $userId})
            MERGE (user)<-[:BELONGS_TO]-(email:EmailAddress {email: $email, nonce: $nonce})
            SET email.createdAt = toString(datetime())
            RETURN email
          `,
          { userId, email, nonce },
        )
        return result.records.map(record => record.get('email').properties)
      })
      try {
        const txResult = await writeTxResultPromise
        response = txResult[0]
      } finally {
        session.close()
      }
      return response
    },
    VerifyEmailAddress: async (_parent, args, context, _resolveInfo) => {},
  },
  EmailAddress: {
    ...Resolver('EmailAddress', {
      undefinedToNull: ['verifiedAt'],
    }),
  },
}
