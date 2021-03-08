import { v4 as uuid } from 'uuid'

export default {
  Mutation: {
    CreateSuggestedResource: async (object, params, context, resolveInfo) => {
      const { driver } = context
      params.id = params.id || uuid()

      const session = driver.session()

      const writeTxResultPromise = session.writeTransaction(async (transaction) => {
        const createSugResourceTransactionResponse = await transaction.run(
          ` 
            CREATE (sgr:SuggestedResource {params})
            SET sgr.createdAt = toString(datetime())
            SET sgr.updatedAt = toString(datetime())
            RETURN sgr
          `,
          { params },
        )
        return createSugResourceTransactionResponse.records.map(
          (record) => record.get('sgr').properties,
        )
      })
      try {
        const [sgr] = await writeTxResultPromise
        return sgr
      } finally {
        session.close()
      }
    },
  },
}
