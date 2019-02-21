// TODO: find a better way how to import the factories
import Factory from '../../../Nitro-Backend/src/seed/factories'
import { getDriver } from '../../../Nitro-Backend/src/bootstrap/neo4j'

const neo4jDriver = getDriver({
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
})
const factory = Factory({neo4jDriver})

beforeEach(async () => {
  await factory.cleanDatabase({ neo4jDriver })
})

Cypress.Commands.add('factory', () => {
  return Factory()
})

Cypress.Commands.add('create', { prevSubject: true }, (factory, node, properties) => {
  return factory.create(node, properties)
})

Cypress.Commands.add('relate', { prevSubject: true }, (factory, node, relationship, properties) => {
  return factory.relate(node, relationship, properties)
})

Cypress.Commands.add('authenticateAs', { prevSubject: true }, (factory, loginCredentials) => {
  return factory.authenticateAs(loginCredentials)
})
