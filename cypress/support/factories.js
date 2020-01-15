import Factory from '../../backend/src/seed/factories'
import { getDriver, getNeode } from '../../backend/src/bootstrap/neo4j'
import neode from 'neode'

const neo4jDriver = getDriver()
const neodeInstance = getNeode()
const factoryOptions = { neo4jDriver, neodeInstance }
const factory = Factory(factoryOptions)

beforeEach(async () => {
  await factory.cleanDatabase()
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
  'create',
  { prevSubject: true },
  async (factory, node, properties) => {
    await factory.create(node, properties)
    return factory
  }
)

Cypress.Commands.add(
  'relate',
  { prevSubject: true },
  async (factory, node, relationship, properties) => {
    await factory.relate(node, relationship, properties)
    return factory
  }
)
