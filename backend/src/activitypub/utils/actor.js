import { activityPub } from '../ActivityPub'

export function createActor (name, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `https://${activityPub.domain}/activitypub/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'name': `${name}`,
    'following': `https://${activityPub.domain}/activitypub/users/${name}/following`,
    'followers': `https://${activityPub.domain}/activitypub/users/${name}/followers`,
    'inbox': `https://${activityPub.domain}/activitypub/users/${name}/inbox`,
    'outbox': `https://${activityPub.domain}/activitypub/users/${name}/outbox`,
    'url': `https://${activityPub.domain}/activitypub/@${name}`,
    'endpoints': {
      'sharedInbox': `https://${activityPub.domain}/activitypub/inbox`
    },
    'publicKey': {
      'id': `https://${activityPub.domain}/activitypub/users/${name}#main-key`,
      'owner': `https://${activityPub.domain}/activitypub/users/${name}`,
      'publicKeyPem': pubkey
    }
  }
}

export function createWebFinger (name) {
  return {
    'subject': `acct:${name}@${activityPub.domain}`,
    'links': [
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `https://${activityPub.domain}/users/${name}`
      }
    ]
  }
}
