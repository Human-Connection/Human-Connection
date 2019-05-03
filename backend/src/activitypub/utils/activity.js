import { activityPub } from '../ActivityPub'
import { signAndSend } from './index'
import crypto from 'crypto'
import as from 'activitystrea.ms'
const debug = require('debug')('ea:utils:activity')

export async function createNoteObject (activityId, objectId, text, actorId, id, published, updated) {
  const object = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${activityId}`,
    'type': 'Create',
    'actor': `${actorId}`,
    'object': {
      'id': `${objectId}`,
      'type': 'Note',
      'published': published,
      'attributedTo': `${actorId}`,
      'content': text,
      'to': ['https://www.w3.org/ns/activitystreams#Public']
    }
  }
  if (updated) {
    object.type = 'Update'
    object.updated = updated
  }
  return object
}

export async function createArticleObject (activityId, objectId, text, actorId, id, published, updated) {
  const object = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${activityId}`,
    'type': 'Create',
    'actor': `${actorId}`,
    'object': {
      'id': `${objectId}`,
      'type': 'Article',
      'published': published,
      'attributedTo': `${actorId}`,
      'content': text,
      'to': 'https://www.w3.org/ns/activitystreams#Public'
    }
  }
  if (updated) {
    object.type = 'Update'
    object.object.updated = updated
  }
  return object
}

export function sendAcceptActivity (theBody, name, targetDomain, url) {
  as.accept()
    .id(`${activityPub.endpoint}/api/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`${activityPub.endpoint}/api/users/${name}`)
    .object(theBody)
    .prettyWrite((err, doc) => {
      if (!err) {
        return signAndSend(doc, name, targetDomain, url)
      } else {
        debug(`error serializing Accept object: ${err}`)
        throw new Error('error serializing Accept object')
      }
    })
}

export function sendRejectActivity (theBody, name, targetDomain, url) {
  as.reject()
    .id(`${activityPub.endpoint}/api/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`${activityPub.endpoint}/api/users/${name}`)
    .object(theBody)
    .prettyWrite((err, doc) => {
      if (!err) {
        return signAndSend(doc, name, targetDomain, url)
      } else {
        debug(`error serializing Accept object: ${err}`)
        throw new Error('error serializing Accept object')
      }
    })
}

export function isPublicAddressed (postObject) {
  if (typeof postObject.to === 'string') {
    postObject.to = [postObject.to]
  }
  if (typeof postObject === 'string') {
    postObject.to = [postObject]
  }
  if (Array.isArray(postObject)) {
    postObject.to = postObject
  }
  return postObject.to.includes('Public') ||
    postObject.to.includes('as:Public') ||
    postObject.to.includes('https://www.w3.org/ns/activitystreams#Public')
}
