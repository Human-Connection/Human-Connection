// import { neo4jgraphql } from "neo4j-graphql-js"
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import zipObject from 'lodash/zipObject'
import generateJwt from './jwt/generateToken'
import { fixUrl } from './middleware/fixImageUrlsMiddleware'
import { neo4jgraphql } from 'neo4j-graphql-js'

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
          countUsers: (await queryOne(queries.countUsers, session)).countUsers,
          countPosts: (await queryOne(queries.countPosts, session)).countPosts,
          countComments: (await queryOne(queries.countComments, session)).countComments,
          countNotifications: (await queryOne(queries.countNotifications, session)).countNotifications,
          countOrganizations: (await queryOne(queries.countOrganizations, session)).countOrganizations,
          countProjects: (await queryOne(queries.countProjects, session)).countProjects,
          countInvites: (await queryOne(queries.countInvites, session)).countInvites,
          countFollows: (await queryOne(queries.countFollows, session)).countFollows,
          countShouts: (await queryOne(queries.countShouts, session)).countShouts
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
      const res = await session.run('MATCH (u:User {email: "' + email + '"}) RETURN u.id, u.slug, u.name, u.avatar, u.email, u.password, u.role LIMIT 1')
      let u = res.records[0]._fields ? zipObject([
        'id',
        'slug',
        'name',
        'avatar',
        'email',
        'password',
        'role'
      ], res.records[0]._fields) : null
      if (u) {
        if (await bcrypt.compareSync(password, u.password)) {
          delete u.password
          u.avatar = fixUrl(u.avatar)
          return Object.assign(u, {
            token: generateJwt(u)
          })
        }
        session.close()
        throw new Error('Incorrect password.')
      }

      session.close()
      throw new Error('No Such User exists.')
    },
    report: async (parent, { resource, description }, { driver, req, user }, resolveInfo) => {
      return neo4jgraphql(parent, { resource, description }, { driver, req, user }, resolveInfo)
      // console.log('params', { resource, description })
      // console.log(`the user with the id ${user.id} tries to create a report on content of type ${resource.type} (${resource.id})`)
      // throw new Error(`resource.id: ${resource.id}, resource.type: ${resource.type}, description: ${description}, user: ${user.id}`)
    }
  }
}
