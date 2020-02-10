import Factory, { cleanDatabase } from '../../backend/src/db/factories'
import { getDriver, getNeode } from '../../backend/src/db/neo4j'

const neo4jConfigs = {
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
}
const neodeInstance = getNeode(neo4jConfigs)

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

Cypress.Commands.add('factory', () => Factory)

Cypress.Commands.add(
  'build',
  { prevSubject: true },
  async (factory, name, atrributes, options) => {
    await factory.build(name, atrributes, options)
    return factory
  }
)

