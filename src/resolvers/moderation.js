export default {
  Mutation: {
    disable: async (object, params, { user, driver }) => {
      const { resource: { id: postId } } = params
      const { id: userId } = user
      const cypher = `
      MATCH (u:User {id: $userId})
      MATCH (p:Post {id: $postId})
      SET p.disabled = true
      MERGE (p)<-[:DISABLED]-(u)
      `
      const session = driver.session()
      const res = await session.run(cypher, { postId, userId })
      session.close()
      return Boolean(res)
    },
    enable: async (object, params, { user, driver }) => {
      const { resource: { id: postId } } = params
      const cypher = `
      MATCH (p:Post {id: $postId})<-[d:DISABLED]-()
      SET p.disabled = false
      DELETE d
      `
      const session = driver.session()
      const res = await session.run(cypher, { postId })
      session.close()
      return Boolean(res)
    }
  }
}
