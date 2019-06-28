import { v1 as neo4j } from 'neo4j-driver'
import CONFIG from './../config'
import Neode from 'neode'

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
    const { NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD } = CONFIG
    neodeInstance = new Neode(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD)
    neodeInstance.model('User', {
      id: { type: 'string', primary: true },
      actorId: 'string',
      name: 'string',
      email: 'string',
      slug: 'string',
      password: 'string',
      avatar: 'string',
      coverImg: 'string',
      deleted: 'boolean',
      disabled: 'boolean',
      role: 'string',
      publicKey: 'string',
      privateKey: 'string',
      wasInvited: 'boolean',
      wasSeeded: 'boolean',
      isVerified: 'boolean',
      locationName: 'string',
      about: 'string',
      disabledBy: { type: 'relationship', relationship: 'DISABLED', target: 'User', direction: 'in' },
      invitedBy: { type: 'relationship', relationship: 'INVITED', target: 'User', direction: 'in' },
      createdAt: 'string',
      updatedAt: 'string',
    })
  }
  return neodeInstance
}
