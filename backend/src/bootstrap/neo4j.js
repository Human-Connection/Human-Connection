import { v1 as neo4j } from 'neo4j-driver'
import CONFIG from './../config'

let driver

export function getDriver(options = {}) {
  const {
    uri = CONFIG.NEO4J_URI,
    username = CONFIG.NEO4J_USERNAME,
    password = CONFIG.NEO4J_PASSWORD,
  } = options
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  }
  return driver
}
