import Factory from '../../backend/src/db/factories'
import { getNeode } from '../../backend/src/db/neo4j'


const neo4jConfigs = {
  uri: Cypress.env('NEO4J_URI'),
  username: Cypress.env('NEO4J_USERNAME'),
  password: Cypress.env('NEO4J_PASSWORD')
}
const neodeInstance = getNeode(neo4jConfigs)

beforeEach(() => cy.then(() => neodeInstance.cypher('MATCH (everything) DETACH DELETE everything;')))

Cypress.Commands.add('neode', () => {
  return neodeInstance
})

Cypress.Commands.add(
  'first',
  { prevSubject: true },
  (neode, model, properties) => {
    return neode.first(model, properties)
  }
)
Cypress.Commands.add(
  'relateTo',
  { prevSubject: true },
  (node, otherNode, relationship) => {
    return node.relateTo(otherNode, relationship)
  }
)

Cypress.Commands.add('factory', () => Factory)

Cypress.Commands.add(
  'build',
  { prevSubject: true },
  (factory, name, atrributes, options) => {
    return new Cypress.Promise((resolve, reject) => {
      return factory.build(name, atrributes, options).then(() => resolve(factory))
    })
  }
)

