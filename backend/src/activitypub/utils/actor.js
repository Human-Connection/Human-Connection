import { activityPub } from '../ActivityPub'

export function createActor (name, pubkey) {
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://w3id.org/security/v1'
    ],
    'id': `https://${activityPub.host}/activitypub/users/${name}`,
    'type': 'Person',
    'preferredUsername': `${name}`,
    'name': `${name}`,
    'following': `https://${activityPub.host}/activitypub/users/${name}/following`,
    'followers': `https://${activityPub.host}/activitypub/users/${name}/followers`,
    'inbox': `https://${activityPub.host}/activitypub/users/${name}/inbox`,
    'outbox': `https://${activityPub.host}/activitypub/users/${name}/outbox`,
    'url': `https://${activityPub.host}/activitypub/@${name}`,
    'endpoints': {
      'sharedInbox': `https://${activityPub.host}/activitypub/inbox`
    },
    'publicKey': {
      'id': `https://${activityPub.host}/activitypub/users/${name}#main-key`,
      'owner': `https://${activityPub.host}/activitypub/users/${name}`,
      'publicKeyPem': pubkey
    }
  }
}

export function createWebFinger (name) {
  return {
    'subject': `acct:${name}@${activityPub.host}`,
    'links': [
      {
        'rel': 'self',
        'type': 'application/activity+json',
        'href': `https://${activityPub.host}/activitypub/users/${name}`
      }
    ]
  }
}
