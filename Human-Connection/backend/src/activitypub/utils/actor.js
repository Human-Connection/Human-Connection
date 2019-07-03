import { activityPub } from '../ActivityPub'

export function createActor(name, pubkey) {
  return {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
    id: `${activityPub.endpoint}/activitypub/users/${name}`,
    type: 'Person',
    preferredUsername: `${name}`,
    name: `${name}`,
    following: `${activityPub.endpoint}/activitypub/users/${name}/following`,
    followers: `${activityPub.endpoint}/activitypub/users/${name}/followers`,
    inbox: `${activityPub.endpoint}/activitypub/users/${name}/inbox`,
    outbox: `${activityPub.endpoint}/activitypub/users/${name}/outbox`,
    url: `${activityPub.endpoint}/activitypub/@${name}`,
    endpoints: {
      sharedInbox: `${activityPub.endpoint}/activitypub/inbox`,
    },
    publicKey: {
      id: `${activityPub.endpoint}/activitypub/users/${name}#main-key`,
      owner: `${activityPub.endpoint}/activitypub/users/${name}`,
      publicKeyPem: pubkey,
    },
  }
}

export function createWebFinger(name) {
  const { host } = new URL(activityPub.endpoint)
  return {
    subject: `acct:${name}@${host}`,
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: `${activityPub.endpoint}/activitypub/users/${name}`,
      },
    ],
  }
}
