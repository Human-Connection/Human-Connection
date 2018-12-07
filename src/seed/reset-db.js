import { query } from '../graphql-schema'
import dotenv from 'dotenv'
import neo4j from '../bootstrap/neo4j'

dotenv.config()

if (process.env.NODE_ENV === 'production') {
  throw new Error('YOU CAN`T UNSEED IN PRODUCTION MODE')
}

const driver = neo4j().getDriver()
const session = driver.session()

query('MATCH (n) DETACH DELETE n', session).then(() => {
  /* eslint-disable-next-line no-console */
  console.log('Successfully deleted all nodes and relations!')
}).catch((err) => {
  /* eslint-disable-next-line no-console */
  console.log(`Error occurred deleting the nodes and relations (reset the db)\n\n${err}`)
}).finally(() => {
  if (session) {
    session.close()
  }
  process.exit(0)
})
