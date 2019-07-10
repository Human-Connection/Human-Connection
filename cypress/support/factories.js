import Factory from '../../backend/src/seed/factories'
import { getDriver } from '../../backend/src/bootstrap/neo4j'
import setupNeode from '../../backend/src/bootstrap/neode'
import neode from 'neode'

const neo4jConfigs = {
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
}
const neo4jDriver = getDriver(neo4jConfigs)
const factory = Factory({ seedServerHost, neo4jDriver, neodeInstance: setupNeode(neo4jConfigs)})
const seedServerHost = Cypress.env('SEED_SERVER_HOST')

beforeEach(async () => {
  await factory.cleanDatabase({ seedServerHost, neo4jDriver })
})

Cypress.Commands.add('factory', () => {
  return Factory({ seedServerHost, neo4jDriver, neodeInstance: setupNeode(neo4jConfigs) })
})

Cypress.Commands.add(
  'create',
  { prevSubject: true },
  (factory, node, properties) => {
    return factory.create(node, properties)
  }
)

Cypress.Commands.add(
  'relate',
  { prevSubject: true },
  (factory, node, relationship, properties) => {
    return factory.relate(node, relationship, properties)
  }
)

Cypress.Commands.add(
  'mutate',
  { prevSubject: true },
  (factory, mutation, variables) => {
    return factory.mutate(mutation, variables)
  }
)

Cypress.Commands.add(
  'authenticateAs',
  { prevSubject: true },
  (factory, loginCredentials) => {
    return factory.authenticateAs(loginCredentials)
  }
)
