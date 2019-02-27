import crypto from 'crypto'
import { activityPub } from '../ActivityPub'
import as from 'activitystrea.ms'
import { signAndSend } from './index'
const debug = require('debug')('ea:utils:activity')

export function createNoteActivity (text, name, id, published) {
  const createUuid = crypto.randomBytes(16).toString('hex')

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `https://${activityPub.domain}/activitypub/users/${name}/status/${createUuid}`,
    'type': 'Create',
    'actor': `https://${activityPub.domain}/activitypub/users/${name}`,
    'object': {
      'id': `https://${activityPub.domain}/activitypub/users/${name}/status/${id}`,
      'type': 'Note',
      'published': published,
      'attributedTo': `https://${activityPub.domain}/activitypub/users/${name}`,
      'content': text,
      'to': 'https://www.w3.org/ns/activitystreams#Public'
    }
  }
}

export function createArticleActivity (text, name, id, published) {
  const createUuid = crypto.randomBytes(16).toString('hex')

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `https://${activityPub.domain}/activitypub/users/${name}/status/${createUuid}`,
    'type': 'Create',
    'actor': `https://${activityPub.domain}/activitypub/users/${name}`,
    'object': {
      'id': `https://${activityPub.domain}/activitypub/users/${name}/status/${id}`,
      'type': 'Article',
      'published': published,
      'attributedTo': `https://${activityPub.domain}/activitypub/users/${name}`,
      'content': text,
      'to': 'https://www.w3.org/ns/activitystreams#Public'
    }
  }
}

export function sendAcceptActivity (theBody, name, targetDomain, url) {
  as.accept()
    .id(`https://${activityPub.domain}/activitypub/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`https://${activityPub.domain}/activitypub/users/${name}`)
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
    .id(`https://${activityPub.domain}/activitypub/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`https://${activityPub.domain}/activitypub/users/${name}`)
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
  return postObject.to.includes('Public') ||
    postObject.to.includes('as:Public') ||
    postObject.to.includes('https://www.w3.org/ns/activitystreams#Public')
}
