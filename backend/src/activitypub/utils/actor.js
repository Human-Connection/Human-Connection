import { activityPub } from '../ActivityPub'

export function createActor (name, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `${activityPub.endpoint}/api/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'name': `${name}`,
    'following': `${activityPub.endpoint}/api/users/${name}/following`,
    'followers': `${activityPub.endpoint}/api/users/${name}/followers`,
    'inbox': `${activityPub.endpoint}/api/users/${name}/inbox`,
    'outbox': `${activityPub.endpoint}/api/users/${name}/outbox`,
    'url': `${activityPub.endpoint}/api/@${name}`,
    'endpoints': {
      'sharedInbox': `${activityPub.endpoint}/api/inbox`
    },
    'publicKey': {
      'id': `${activityPub.endpoint}/api/users/${name}#main-key`,
      'owner': `${activityPub.endpoint}/api/users/${name}`,
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
        'href': `${activityPub.endpoint}/api/users/${name}`
      }
    ]
  }
}
