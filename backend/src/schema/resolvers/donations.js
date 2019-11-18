export default {
  Mutation: {
    UpdateDonations: async (_parent, params, context, _resolveInfo) => {
      const { driver } = context
      const session = driver.session()
      let donations
      const writeTxResultPromise = session.writeTransaction(async txc => {
        const updateDonationsTransactionResponse = await txc.run(
          ` 
            MATCH (donations:Donations)
            WITH donations LIMIT 1
            SET donations += $params
            SET donations.updatedAt = toString(datetime())
            RETURN donations
          `,
          { params },
        )
        return updateDonationsTransactionResponse.records.map(
          record => record.get('donations').properties,
        )
      })
      try {
        const txResult = await writeTxResultPromise
        if (!txResult[0]) return null
        donations = txResult[0]
      } finally {
        session.close()
      }
      return donations
    },
  },
}
