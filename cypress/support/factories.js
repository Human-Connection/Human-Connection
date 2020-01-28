import Factory, { cleanDatabase } from '../../backend/src/factories'
import { getDriver, getNeode } from '../../backend/src/db/neo4j'

const neo4jConfigs = {
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
}
const neo4jDriver = getDriver(neo4jConfigs)
const neodeInstance = getNeode(neo4jConfigs)
const factoryOptions = { neo4jDriver, neodeInstance }
const factory = Factory(factoryOptions)

beforeEach(async () => {
  await cleanDatabase()
})

Cypress.Commands.add('neode', () => {
  return neodeInstance
})
Cypress.Commands.add(
  'first',
  { prevSubject: true },
  async (neode, model, properties) => {
    return neode.first(model, properties)
  }
)
Cypress.Commands.add(
  'relateTo',
  { prevSubject: true },
  async (node, otherNode, relationship) => {
    return node.relateTo(otherNode, relationship)
  }
)

Cypress.Commands.add('factory', () => {
  return Factory(factoryOptions)
})

Cypress.Commands.add(
  'build',
  { prevSubject: true },
  async (factory, node, properties, options) => {
    await Factory.build(node, properties, options)
    return factory
  }
)

