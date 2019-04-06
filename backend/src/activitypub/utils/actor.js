import { activityPub } from '../ActivityPub'

export function createActor (name, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `${activityPub.endpoint}/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'name': `${name}`,
    'following': `${activityPub.endpoint}/users/${name}/following`,
    'followers': `${activityPub.endpoint}/users/${name}/followers`,
    'inbox': `${activityPub.endpoint}/users/${name}/inbox`,
    'outbox': `${activityPub.endpoint}/users/${name}/outbox`,
    'url': `${activityPub.endpoint}/@${name}`,
    'endpoints': {
      'sharedInbox': `${activityPub.endpoint}/inbox`
    },
    'publicKey': {
      'id': `${activityPub.endpoint}/users/${name}#main-key`,
      'owner': `${activityPub.endpoint}/users/${name}`,
      'publicKeyPem': pubkey
    }
  }
}

export function createWebFinger (name) {
  const { host } = new URL(activityPub.endpoint)
  return {
    'subject': `acct:${name}@${host}`,
    'links': [
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `${activityPub.endpoint}/users/${name}`
      }
    ]
  }
}
