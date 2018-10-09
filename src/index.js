// import { GraphQLServer } from 'graphql-yoga'
import { applyMiddleware } from 'graphql-middleware'
import { ApolloServer, makeExecutableSchema } from 'apollo-server'
import { augmentSchema } from 'neo4j-graphql-js'
import { typeDefs, resolvers } from './graphql-schema'
import { v1 as neo4j } from 'neo4j-driver'
import passwordMiddleware from './middleware/passwordMiddleware'
import sluggifyMiddleware from './middleware/sluggifyMiddleware'
import excerptMiddleware from './middleware/excerptMiddleware'
import dotenv from 'dotenv'
import {
  GraphQLLowerCaseDirective,
  GraphQLTrimDirective,
  GraphQLDefaultToDirective
} from 'graphql-custom-directives';
import faker from 'faker'

dotenv.config()

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// augmentSchema will add auto generated mutations based on types in schema
const augmentedSchema = augmentSchema(schema)

// add custom directives
const directives = [
  GraphQLLowerCaseDirective,
  GraphQLTrimDirective,
  GraphQLDefaultToDirective
]
augmentedSchema._directives.push.apply(augmentedSchema._directives, directives)

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'neo4j'
  )
)

const MOCK = (process.env.MOCK === 'true')
console.log('MOCK:', MOCK)

/* const logInput = async (resolve, root, args, context, info) => {
  console.log(args)
  if (args.email) {
    args.email = args.email.toLowerCase()
  }
  console.log(`1. logInput: ${JSON.stringify(args)}`)
  const result = await resolve(root, args, context, info)
  console.log(`5. logInput`)
  return result
}

const logResult = async (resolve, root, args, context, info) => {
  console.log(`2. logResult`)
  let result = await resolve(root, args, context, info)
  console.log('RESULT:', result)
  if (Array.isArray(result)) {
    result.forEach(res => {
      if (res.email) {
        res.email = '******'
        // res.email = res.email.toLowerCase()
      }
    })
  } else if (typeof result === 'string' && info.fieldName === 'email') {
    result = '******'
    // result = result.toLowerCase()
  }
  console.log(`4. logResult: ${JSON.stringify(result)}`)
  return result
} */

const server = new ApolloServer({
  context: {
    driver
  },
  tracing: true,
  schema: applyMiddleware(augmentedSchema, passwordMiddleware, sluggifyMiddleware, excerptMiddleware),
  mocks: MOCK ? {
    User: () => ({
      name: () => `${faker.name.firstName()} ${faker.name.lastName()}`,
      email: () => `${faker.internet.email()}`
    }),
    Post: () => ({
      title: () => faker.lorem.lines(1),
      slug: () => faker.lorem.slug(3),
      content: () => faker.lorem.paragraphs(5),
      contentExcerpt: () => faker.lorem.paragraphs(1)
    })
  } : false
})
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url} 🚀`);
})
