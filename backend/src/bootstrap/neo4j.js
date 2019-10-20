import { v1 as neo4j } from 'neo4j-driver'
import CONFIG from './../config'
import setupNeode from './neode'

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

let neodeInstance
export function neode() {
  if (!neodeInstance) {
    const { NEO4J_URI: uri, NEO4J_USERNAME: username, NEO4J_PASSWORD: password } = CONFIG
    neodeInstance = setupNeode({ uri, username, password })
  }
  return neodeInstance
}
