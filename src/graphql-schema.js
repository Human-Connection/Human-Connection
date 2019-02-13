// import { neo4jgraphql } from "neo4j-graphql-js"
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import generateJwt from './jwt/generateToken'
import uuid from 'uuid/v4'
import { fixUrl } from './middleware/fixImageUrlsMiddleware'
import { AuthenticationError } from 'apollo-server'

export const typeDefs =
  fs.readFileSync(process.env.GRAPHQL_SCHEMA || path.join(__dirname, 'schema.graphql'))
    .toString('utf-8')

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

export const resolvers = {
  Query: {
    isLoggedIn: (parent, args, { driver, user }) => {
      return Boolean(user && user.id)
    },
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
    // usersBySubstring: neo4jgraphql
  },
  Mutation: {
    signup: async (parent, { email, password }, { req }) => {
      // if (data[email]) {
      //   throw new Error('Another User with same email exists.')
      // }
      // data[email] = {
      //   password: await bcrypt.hashSync(password, 10),
      // }

      return true
    },
    login: async (parent, { email, password }, { driver, req, user }) => {
      // if (user && user.id) {
      //   throw new Error('Already logged in.')
      // }
      const session = driver.session()
      return session.run(
        'MATCH (user:User {email: $userEmail}) ' +
        'RETURN user {.id, .slug, .name, .avatar, .locationName, .about, .email, .password, .role} as user LIMIT 1', {
          userEmail: email
        })
        .then(async (result) => {
          session.close()
          const [currentUser] = await result.records.map(function (record) {
            return record.get('user')
          })

          if (currentUser && await bcrypt.compareSync(password, currentUser.password)) {
            delete currentUser.password
            currentUser.avatar = fixUrl(currentUser.avatar)
            return Object.assign(currentUser, {
              token: generateJwt(currentUser)
            })
          } else throw new AuthenticationError('Incorrect email address or password.')
        })
    },
    report: async (parent, { resource, description }, { driver, req, user }, resolveInfo) => {
      const contextId = uuid()
      const session = driver.session()
      const data = {
        id: contextId,
        type: resource.type,
        createdAt: (new Date()).toISOString(),
        description: resource.description
      }
      await session.run(
        'CREATE (r:Report $report) ' +
        'RETURN r.id, r.type, r.description', {
          report: data
        }
      )
      let contentType

      switch (resource.type) {
      case 'post':
      case 'contribution':
        contentType = 'Post'
        break
      case 'comment':
        contentType = 'Comment'
        break
      case 'user':
        contentType = 'User'
        break
      }

      await session.run(
        `MATCH (author:User {id: $userId}), (context:${contentType} {id: $resourceId}), (report:Report {id: $contextId}) ` +
        'MERGE (report)<-[:REPORTED]-(author) ' +
        'MERGE (context)<-[:REPORTED]-(report) ' +
        'RETURN context', {
          resourceId: resource.id,
          userId: user.id,
          contextId: contextId
        }
      )
      session.close()

      // TODO: output Report compatible object
      return data
    }
  }
}
