import createOrUpdateLocations from './nodes/locations'

export default {
  Mutation: {
    SignupVerification: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const hasAgreedToLatestTermsAndConditions = false

      const { currentUser } = context
      if (
        !!currentUser &&
        !!args.hasAgreedToLatestTermsAndConditions &&
        args.hasAgreedToLatestTermsAndConditions
      ) {
        const session = context.driver.session()
        const cypher = `
          MATCH (user: User { id: $userId})
          SET user.termsAndConditionsAgreedAt = $createdAt
          SET user.termsAndConditionsAgreedVersion = $version
          RETURN user { .termsAndConditionsAgreedAt, .termsAndConditionsAgreedVersion }
        `
        const variable = {
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          version: '0.0.3',
        }
        const transactionResult = await session.run(cypher, variable)
        const [resultCurrentUser] = transactionResult.records.map(record => {
          return record.get('user')
        })
        session.close()

        if (
          !!resultCurrentUser &&
          !!resultCurrentUser.termsAndConditionsAgreedAt &&
          !!resultCurrentUser.termsAndConditionsAgreedVersion
        ) {
          this.hasAgreedToLatestTermsAndConditions = true
        }
      }

      const result = await resolve(root, args, context, info)

      if (
        !!currentUser &&
        !!args.hasAgreedToLatestTermsAndConditions &&
        args.hasAgreedToLatestTermsAndConditions
      ) {
        result.hasAgreedToLatestTermsAndConditions = hasAgreedToLatestTermsAndConditions
      }

      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
  },
}
