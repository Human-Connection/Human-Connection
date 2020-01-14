import { getNeode } from '../bootstrap/neo4j'

(async() => {
  await getNeode().schema.install()
  console.log('Schema installed!')
  process.exit(0)
})()
