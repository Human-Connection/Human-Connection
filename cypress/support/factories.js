// TODO: find a better way how to import the factories
import Factory from '../../../Nitro-Backend/src/seed/factories'
import { getDriver } from '../../../Nitro-Backend/src/bootstrap/neo4j'

const neo4jDriver = getDriver({
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
})
const factory = Factory({ neo4jDriver })
const seedServerHost = Cypress.env('SEED_SERVER_HOST')

beforeEach(async () => {
  await factory.cleanDatabase({ seedServerHost, neo4jDriver })
})

Cypress.Commands.add('factory', () => {
  return Factory({ seedServerHost })
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
