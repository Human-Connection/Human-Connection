export default {
  Mutation: {
    disable: async (object, params, { user, driver }) => {
      const { resource: { id } } = params
      const { id: userId } = user
      const cypher = `
      MATCH (u:User {id: $userId})
      MATCH (r {id: $id})
      SET r.disabled = true
      MERGE (r)<-[:DISABLED]-(u)
      `
      const session = driver.session()
      const res = await session.run(cypher, { id, userId })
      session.close()
      return Boolean(res)
    },
    enable: async (object, params, { user, driver }) => {
      const { resource: { id } } = params
      const cypher = `
      MATCH (p {id: $id})<-[d:DISABLED]-()
      SET p.disabled = false
      DELETE d
      `
      const session = driver.session()
      const res = await session.run(cypher, { id })
      session.close()
      return Boolean(res)
    }
  }
}
