import { activityPub } from '../ActivityPub'
import { signAndSend, throwErrorIfApolloErrorOccurred } from './index'

import crypto from 'crypto'
import as from 'activitystrea.ms'
import gql from 'graphql-tag'
const debug = require('debug')('ea:utils:activity')

export function createNoteObject (text, name, id, published) {
  const createUuid = crypto.randomBytes(16).toString('hex')

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${activityPub.endpoint}/activitypub/users/${name}/status/${createUuid}`,
    'type': 'Create',
    'actor': `${activityPub.endpoint}/activitypub/users/${name}`,
    'object': {
      'id': `${activityPub.endpoint}/activitypub/users/${name}/status/${id}`,
      'type': 'Note',
      'published': published,
      'attributedTo': `${activityPub.endpoint}/activitypub/users/${name}`,
      'content': text,
      'to': 'https://www.w3.org/ns/activitystreams#Public'
    }
  }
}

export async function createArticleObject (activityId, objectId, text, name, id, published) {
  const actorId = await getActorId(name)

  return {
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
}

export async function getActorId (name) {
  const result = await activityPub.dataSource.client.query({
    query: gql`
        query {
            User(slug: "${name}") {
                actorId
            }
        }
    `
  })
  throwErrorIfApolloErrorOccurred(result)
  if (Array.isArray(result.data.User) && result.data.User[0]) {
    return result.data.User[0].actorId
  } else {
    throw Error(`No user with name: ${name}`)
  }
}

export function sendAcceptActivity (theBody, name, targetDomain, url) {
  as.accept()
    .id(`${activityPub.endpoint}/activitypub/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`${activityPub.endpoint}/activitypub/users/${name}`)
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
    .id(`${activityPub.endpoint}/activitypub/users/${name}/status/` + crypto.randomBytes(16).toString('hex'))
    .actor(`${activityPub.endpoint}/activitypub/users/${name}`)
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
