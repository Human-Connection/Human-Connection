import createOrUpdateLocations from './nodes/locations'

export default {
  Query: {
    currentUser: async (resolve, root, args, context, info) => {
      console.log('currentUser middleware !!!') 
      const currentTermsAndConditionsDate = new Date('2019-08-19T12:23:23.344Z')

      const { user } = context
      if (!!user) {
        args.hasAgreedToLatestTermsAndConditions = false
        
        console.log('Current user is defined !!!') 
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
        
        console.log('currentUser middleware !!!') 
        console.log('currentUser: ', currentUser) 
        console.log('currentUser.termsAndConditionsConfirmedAt: ', currentUser.termsAndConditionsConfirmedAt) 
        console.log('Dummy') 
        console.log('Dummy') 
        console.log('Dummy') 
        console.log('Dummy') 
        console.log('Dummy') 
        console.log("2019-08-19T12:23:23.344Z")
        console.log("2019-08-19T12:23:23.344Z")
        console.log(new Date())
        console.log(new Date())
        if (!!currentUser && !!currentUser.termsAndConditionsConfirmedAt) {
          console.log("ssssssssssssssssssssssssssssssss")
          console.log(currentUser.termsAndConditionsConfirmedAt < currentTermsAndConditionsDate)
          args.hasAgreedToLatestTermsAndConditions = currentUser.termsAndConditionsConfirmedAt < currentTermsAndConditionsDate 
          console.log(args.hasAgreedToLatestTermsAndConditions)
          console.log(args.hasAgreedToLatestTermsAndConditions)
          console.log('currentUser.termsAndConditionsConfirmedAt: ', currentUser.termsAndConditionsConfirmedAt) 
          console.log('currentUser.termsAndConditionsConfirmedAt: ', currentUser.termsAndConditionsConfirmedAt) 
          console.log('currentUser.termsAndConditionsConfirmedAt: ', currentUser.termsAndConditionsConfirmedAt) 
          console.log('currentUser.termsAndConditionsConfirmedAt: ', currentUser.termsAndConditionsConfirmedAt) 
        }
      }

      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
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
      const result = await resolve(root, args, context, info)
      await createOrUpdateLocations(args.id, args.locationName, context.driver)
      return result
    },
  },
}
