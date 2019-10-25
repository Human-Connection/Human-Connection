export default {
  Mutation: {
    disable: async (object, params, { user, driver }) => {
      const { id } = params
      const { id: userId } = user
      const cypher = `
      MATCH (u:User {id: $userId})
      MATCH (resource {id: $id})
      WHERE resource:User OR resource:Comment OR resource:Post
      SET resource.disabled = true
      MERGE (resource)<-[decided:DECIDED]-(u)
      SET (
      CASE
      WHEN decided.createdAt IS NOT NULL
      THEN decided END).updatedAt = toString(datetime())
      SET (
      CASE
      WHEN decided.createdAt IS NULL
      THEN decided END).createdAt = toString(datetime())
      SET decided.disabled = true
      RETURN resource {.id}
      `
      const session = driver.session()
      const res = await session.run(cypher, { id, userId })
      session.close()
      const [resource] = res.records.map(record => {
        return record.get('resource')
      })
      if (!resource) return null
      return resource.id
    },
    enable: async (object, params, { user, driver }) => {
      const { id } = params
      const cypher = `
      MATCH (resource {id: $id})<-[decided:DECIDED]-(:User)
      SET resource.disabled = false
      DELETE decided
      RETURN resource {.id}
      `
      // Wolle
      // SET decided.updatedAt = toString(datetime())
      // SET decided.disabled = false
      const session = driver.session()
      const res = await session.run(cypher, { id })
      session.close()
      const [resource] = res.records.map(record => {
        return record.get('resource')
      })
      if (!resource) return null
      return resource.id
    },
  },
}
