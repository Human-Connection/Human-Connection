import Neode from 'neode'
import uuid from 'uuid/v4'

export default function setupNeode(options) {
  const { uri, username, password } = options
  const neodeInstance = new Neode(uri, username, password)
  neodeInstance.model('InvitationCode', {
    createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    token: { type: 'string', primary: true, token: true },
    generatedBy: {
      type: 'relationship',
      relationship: 'GENERATED',
      target: 'User',
      direction: 'in',
    },
    activated: {
      type: 'relationship',
      relationship: 'ACTIVATED',
      target: 'EmailAddress',
      direction: 'out',
    },
  })
  neodeInstance.model('EmailAddress', {
    email: { type: 'string', primary: true, lowercase: true, email: true },
    createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    verifiedAt: { type: 'string', isoDate: true },
    nonce: { type: 'string', token: true },
    belongsTo: {
      type: 'relationship',
      relationship: 'BELONGS_TO',
      target: 'User',
      direction: 'out',
    },
  })
  neodeInstance.model('User', {
    id: { type: 'string', primary: true, default: uuid }, // TODO: should be type: 'uuid' but simplified for our tests
    actorId: { type: 'string', allow: [null] },
    name: { type: 'string', min: 3 },
    email: { type: 'string', lowercase: true, email: true },
    slug: 'string',
    encryptedPassword: 'string',
    avatar: { type: 'string', allow: [null] },
    coverImg: { type: 'string', allow: [null] },
    deleted: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
    role: 'string',
    publicKey: 'string',
    privateKey: 'string',
    wasInvited: 'boolean',
    wasSeeded: 'boolean',
    locationName: { type: 'string', allow: [null] },
    about: { type: 'string', allow: [null] },
    primaryEmail: {
      type: 'relationship',
      relationship: 'PRIMARY_EMAIL',
      target: 'EmailAddress',
      direction: 'out',
    },
    following: {
      type: 'relationship',
      relationship: 'FOLLOWS',
      target: 'User',
      direction: 'out',
    },
    followedBy: {
      type: 'relationship',
      relationship: 'FOLLOWS',
      target: 'User',
      direction: 'in',
    },
    friends: { type: 'relationship', relationship: 'FRIENDS', target: 'User', direction: 'both' },
    disabledBy: {
      type: 'relationship',
      relationship: 'DISABLED',
      target: 'User',
      direction: 'in',
    },
    invitedBy: { type: 'relationship', relationship: 'INVITED', target: 'User', direction: 'in' },
    createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    updatedAt: {
      type: 'string',
      isoDate: true,
      required: true,
      default: () => new Date().toISOString(),
    },
  })
  return neodeInstance
}
