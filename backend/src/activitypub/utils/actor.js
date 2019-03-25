import { activityPub } from '../ActivityPub'

export function createActor (name, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `https://${activityPub.hostname}/activitypub/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'name': `${name}`,
    'following': `https://${activityPub.hostname}/activitypub/users/${name}/following`,
    'followers': `https://${activityPub.hostname}/activitypub/users/${name}/followers`,
    'inbox': `https://${activityPub.hostname}/activitypub/users/${name}/inbox`,
    'outbox': `https://${activityPub.hostname}/activitypub/users/${name}/outbox`,
    'url': `https://${activityPub.hostname}/activitypub/@${name}`,
    'endpoints': {
      'sharedInbox': `https://${activityPub.hostname}/activitypub/inbox`
    },
    'publicKey': {
      'id': `https://${activityPub.hostname}/activitypub/users/${name}#main-key`,
      'owner': `https://${activityPub.hostname}/activitypub/users/${name}`,
      'publicKeyPem': pubkey
    }
  }
}

export function createWebFinger (name) {
  return {
    'subject': `acct:${name}@${activityPub.hostname}`,
    'links': [
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `https://${activityPub.hostname}/activitypub/users/${name}`
      }
    ]
  }
}
