import createOrUpdateLocations from './nodes/locations'

export default {
  Mutation: {
    SignupVerification: async (resolve, root, args, context, info) => {
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
    UpdateUser: async (resolve, root, args, context, info) => {
      const { currentUser } = context
      if (
        !!currentUser &&
        !!args.termsAndConditionsAgreedVersion &&
        args.termsAndConditionsAgreedVersion
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
          version: args.termsAndConditionsAgreedVersion,
        }
        await session.run(cypher, variable)
        // console.log('Nach dem speichern')
        // console.log(transactionResult)
        // console.log('-------------------------------------')
        session.close()
      }

      const result = await resolve(root, args, context, info)

      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
  },
}
