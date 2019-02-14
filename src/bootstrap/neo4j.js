import { v1 as neo4j } from 'neo4j-driver'

let driver

export default function () {
  return {
    getDriver () {
      if (!driver) {
        driver = neo4j.driver(
          process.env.NEO4J_URI || 'bolt://localhost:7687',
          neo4j.auth.basic(
            process.env.NEO4J_USERNAME || 'neo4j',
            process.env.NEO4J_PASSWORD || 'neo4j'
          )
        )
      }
      return driver
    }
  }
}
