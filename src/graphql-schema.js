// import { neo4jgraphql } from "neo4j-graphql-js"
import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'
import zipObject from 'lodash/zipObject'
import generateJwt from './jwt/generateToken'
import { fixUrl } from './middleware/fixImageUrlsMiddleware'

export const typeDefs =
  fs.readFileSync(process.env.GRAPHQL_SCHEMA || path.join(__dirname, "schema.graphql"))
    .toString('utf-8')

export const resolvers = {
  Query: {
    isLoggedIn: (parent, args, { user }) => {
      console.log(user)
      return Boolean(user && user.id)
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
        throw new Error('Incorrect password.')
      }

      throw new Error('No Such User exists.')
    }
  }
}
