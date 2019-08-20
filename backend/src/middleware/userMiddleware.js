import createOrUpdateLocations from './nodes/locations'

export default {
  Query: {
    currentUser: async (resolve, root, args, context, info) => {

      const result = await resolve(root, args, context, info)
   
      const currentTermsAndConditionsDate = new Date('2018-11-09T12:23:23.344Z')

      const { user } = context
      if (!!user) {
        result.hasAgreedToLatestTermsAndConditions = false
        
        const session = context.driver.session()
        const cypher = `
          MATCH (user: User { id: $userId})
          RETURN user { .termsAndConditionsConfirmedAt }
        `
        const variable = {
          userId: context.user.id
        }
        const transactionResult = await session.run(
          cypher,
          variable,
        )
        const [currentUser] = transactionResult.records.map(record => {
          return record.get('user')
        })
        session.close()
        
        if (!!currentUser && !!currentUser.termsAndConditionsConfirmedAt) {
          result.hasAgreedToLatestTermsAndConditions = new Date (currentUser.termsAndConditionsConfirmedAt) > currentTermsAndConditionsDate 
        }
      }

      return result
    },
  },
  Mutation: {
    SignupVerification: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      console.log(args)

      const hasAgreedToLatestTermsAndConditions = false

      const { currentUser } = context
      if (!!currentUser && !!args.hasAgreedToLatestTermsAndConditions && args.hasAgreedToLatestTermsAndConditions) {
        const session = context.driver.session()
        const cypher = `
          MATCH (user: User { id: $userId})
          SET user.termsAndConditionsConfirmedAt = $createdAt
          SET user.termsAndConditionsVersion = $version
          RETURN user { .termsAndConditionsConfirmedAt, .termsAndConditionsVersion }
        `
        const variable = {
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          version: "0.0.1"
        }
        const transactionResult = await session.run(
          cypher,
          variable,
        )
        const [resultCurrentUser] = transactionResult.records.map(record => {
          return record.get('user')
        })
        session.close()

        if (!!resultCurrentUser && !!resultCurrentUser.termsAndConditionsConfirmedAt && !!resultCurrentUser.termsAndConditionsVersion) {
          hasAgreedToLatestTermsAndConditions = true
        }
      }

      const result = await resolve(root, args, context, info)

      if (!!currentUser && !!args.hasAgreedToLatestTermsAndConditions && args.hasAgreedToLatestTermsAndConditions) {
        result.hasAgreedToLatestTermsAndConditions = hasAgreedToLatestTermsAndConditions
      }

      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
  },
}

 