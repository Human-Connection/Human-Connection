export const query = (cypher, session) => {
  return new Promise((resolve, reject) => {
    let data = []
    session
      .run(cypher)
      .subscribe({
        onNext: function (record) {
          let item = {}
          record.keys.forEach(key => {
            item[key] = record.get(key)
          })
          data.push(item)
        },
        onCompleted: function () {
          session.close()
          resolve(data)
        },
        onError: function (error) {
          reject(error)
        }
      })
  })
}
const queryOne = (cypher, session) => {
  return new Promise((resolve, reject) => {
    query(cypher, session)
      .then(res => {
        resolve(res.length ? res.pop() : {})
      })
      .catch(err => {
        reject(err)
      })
  })
}

export default {
  Query: {
    statistics: async (parent, args, { driver, user }) => {
      return new Promise(async (resolve) => {
        const session = driver.session()
        const queries = {
          countUsers: 'MATCH (r:User) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countUsers',
          countPosts: 'MATCH (r:Post) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countPosts',
          countComments: 'MATCH (r:Comment) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countComments',
          countNotifications: 'MATCH (r:Notification) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countNotifications',
          countOrganizations: 'MATCH (r:Organization) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countOrganizations',
          countProjects: 'MATCH (r:Project) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countProjects',
          countInvites: 'MATCH (r:Invite) WHERE r.wasUsed <> true OR NOT exists(r.wasUsed) RETURN COUNT(r) AS countInvites',
          countFollows: 'MATCH (:User)-[r:FOLLOWS]->(:User) RETURN COUNT(r) AS countFollows',
          countShouts: 'MATCH (:User)-[r:SHOUTED]->(:Post) RETURN COUNT(r) AS countShouts'
        }
        let data = {
          countUsers: (await queryOne(queries.countUsers, session)).countUsers.low,
          countPosts: (await queryOne(queries.countPosts, session)).countPosts.low,
          countComments: (await queryOne(queries.countComments, session)).countComments.low,
          countNotifications: (await queryOne(queries.countNotifications, session)).countNotifications.low,
          countOrganizations: (await queryOne(queries.countOrganizations, session)).countOrganizations.low,
          countProjects: (await queryOne(queries.countProjects, session)).countProjects.low,
          countInvites: (await queryOne(queries.countInvites, session)).countInvites.low,
          countFollows: (await queryOne(queries.countFollows, session)).countFollows.low,
          countShouts: (await queryOne(queries.countShouts, session)).countShouts.low
        }
        resolve(data)
      })
    }
  }
}
