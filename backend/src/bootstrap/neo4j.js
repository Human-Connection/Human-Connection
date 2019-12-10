import { v1 as neo4j } from 'neo4j-driver'
import CONFIG from './../config'
import Neode from 'neode'
import models from '../models'

let driver
const defaultOptions = {
  uri: CONFIG.NEO4J_URI,
  username: CONFIG.NEO4J_USERNAME,
  password: CONFIG.NEO4J_PASSWORD,
}

export function getDriver(options = {}) {
  const { uri, username, password } = { ...defaultOptions, ...options }
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
  }
  return driver
}

let neodeInstance
export function getNeode(options = {}) {
  if (!neodeInstance) {
    const { uri, username, password } = { ...defaultOptions, ...options }
    neodeInstance = new Neode(uri, username, password).with(models)
    return neodeInstance
  }
  return neodeInstance
}
