import { activityPub } from '../ActivityPub'
import { constructIdFromName } from './index'
const debug = require('debug')('ea:utils:collections')

export function createOrderedCollection (name, collectionName) {
  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${activityPub.endpoint}/api/users/${name}/${collectionName}`,
    'summary': `${name}s ${collectionName} collection`,
    'type': 'OrderedCollection',
    'first': `${activityPub.endpoint}/api/users/${name}/${collectionName}?page=true`,
    'totalItems': 0
  }
}

export function createOrderedCollectionPage (name, collectionName) {
  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'id': `${activityPub.endpoint}/api/users/${name}/${collectionName}?page=true`,
    'summary': `${name}s ${collectionName} collection`,
    'type': 'OrderedCollectionPage',
    'totalItems': 0,
    'partOf': `${activityPub.endpoint}/api/users/${name}/${collectionName}`,
    'orderedItems': []
  }
}
export async function sendCollection (collectionName, req, res) {
  const name = req.params.name
  const id = constructIdFromName(name)

  switch (collectionName) {
  case 'followers':
    await attachThenCatch(activityPub.collections.getFollowersCollection(id), res)
    break

  case 'followersPage':
    await attachThenCatch(activityPub.collections.getFollowersCollectionPage(id), res)
    break

  case 'following':
    await attachThenCatch(activityPub.collections.getFollowingCollection(id), res)
    break

  case 'followingPage':
    await attachThenCatch(activityPub.collections.getFollowingCollectionPage(id), res)
    break

  case 'outbox':
    await attachThenCatch(activityPub.collections.getOutboxCollection(id), res)
    break

  case 'outboxPage':
    await attachThenCatch(activityPub.collections.getOutboxCollectionPage(id), res)
    break

  default:
    res.status(500).end()
  }
}

function attachThenCatch (promise, res) {
  return promise
    .then((collection) => {
      res.status(200).contentType('application/activity+json').send(collection)
    })
    .catch((err) => {
      debug(`error getting a Collection: = ${err}`)
      res.status(500).end()
    })
}
