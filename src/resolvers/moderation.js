export default {
  Mutation: {
    disable: async (object, params, { user, driver }) => {
      const { id } = params
      const { id: userId } = user
      const cypher = `
      MATCH (u:User {id: $userId})
      MATCH (resource {id: $id})
      SET resource.disabled = true
      MERGE (resource)<-[:DISABLED]-(u)
      RETURN resource {.id}
      `
      const session = driver.session()
      const res = await session.run(cypher, { id, userId })
      const [resource] = res.records.map((record) => {
        return record.get('resource')
      })
      session.close()
      return resource.id
    },
    enable: async (object, params, { user, driver }) => {
      const { id } = params
      const cypher = `
      MATCH (resource {id: $id})<-[d:DISABLED]-()
      SET resource.disabled = false
      DELETE d
      RETURN resource {.id}
      `
      const session = driver.session()
      const res = await session.run(cypher, { id })
      const [resource] = res.records.map((record) => {
        return record.get('resource')
      })
      session.close()
      return resource.id
    }
  }
}
