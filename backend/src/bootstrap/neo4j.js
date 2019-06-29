import { v1 as neo4j } from 'neo4j-driver'
import CONFIG from './../config'
import Neode from 'neode'
import uuid from 'uuid/v4'

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
      id: { type: 'string', primary: true, default: uuid }, // TODO: should be type: 'uuid' but simplified for our tests
      actorId: 'string',
      name: { type: 'string', min: 3 },
      email: { type: 'string', email: true },
      slug: 'string',
      password: 'string',
      avatar: 'string',
      coverImg: 'string',
      deleted: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      role: 'string',
      publicKey: 'string',
      privateKey: 'string',
      wasInvited: 'boolean',
      wasSeeded: 'boolean',
      isVerified: 'boolean',
      locationName: 'string',
      about: 'string',
      following:  { type: 'relationship', relationship: 'FOLLOWS', target: 'User', direction: 'out' },
      followedBy:  { type: 'relationship', relationship: 'FOLLOWS', target: 'User', direction: 'in' },
      friends:  { type: 'relationship', relationship: 'FRIENDS', target: 'User', direction: 'both' },
      disabledBy: { type: 'relationship', relationship: 'DISABLED', target: 'User', direction: 'in' },
      invitedBy: { type: 'relationship', relationship: 'INVITED', target: 'User', direction: 'in' },
      createdAt: { type: 'string', isoDate: true },
      updatedAt: { type: 'string', isoDate: true },
    })
  }
  return neodeInstance
}
