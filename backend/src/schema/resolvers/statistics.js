export const query = (cypher, session) => {
  return new Promise((resolve, reject) => {
    const data = []
    session.run(cypher).subscribe({
      onNext: function(record) {
        const item = {}
        record.keys.forEach(key => {
          item[key] = record.get(key)
        })
        data.push(item)
      },
      onCompleted: function() {
        session.close()
        resolve(data)
      },
      onError: function(error) {
        reject(error)
      },
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
      return new Promise(resolve => {
        const session = driver.session()
        const queries = {
          countUsers:
            'MATCH (r:User) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countUsers',
          countPosts:
            'MATCH (r:Post) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countPosts',
          countComments:
            'MATCH (r:Comment) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countComments',
          countNotifications:
            'MATCH (r:Notification) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countNotifications',
          countOrganizations:
            'MATCH (r:Organization) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countOrganizations',
          countProjects:
            'MATCH (r:Project) WHERE r.deleted <> true OR NOT exists(r.deleted) RETURN COUNT(r) AS countProjects',
          countInvites:
            'MATCH (r:Invite) WHERE r.wasUsed <> true OR NOT exists(r.wasUsed) RETURN COUNT(r) AS countInvites',
          countFollows: 'MATCH (:User)-[r:FOLLOWS]->(:User) RETURN COUNT(r) AS countFollows',
          countShouts: 'MATCH (:User)-[r:SHOUTED]->(:Post) RETURN COUNT(r) AS countShouts',
        }
        const data = {
          countUsers: queryOne(queries.countUsers, session).then(res => res.countUsers.low),
          countPosts: queryOne(queries.countPosts, session).then(res => res.countPosts.low),
          countComments: queryOne(queries.countComments, session).then(
            res => res.countComments.low,
          ),
          countNotifications: queryOne(queries.countNotifications, session).then(
            res => res.countNotifications.low,
          ),
          countOrganizations: queryOne(queries.countOrganizations, session).then(
            res => res.countOrganizations.low,
          ),
          countProjects: queryOne(queries.countProjects, session).then(
            res => res.countProjects.low,
          ),
          countInvites: queryOne(queries.countInvites, session).then(res => res.countInvites.low),
          countFollows: queryOne(queries.countFollows, session).then(res => res.countFollows.low),
          countShouts: queryOne(queries.countShouts, session).then(res => res.countShouts.low),
        }
        resolve(data)
      })
    },
  },
}
