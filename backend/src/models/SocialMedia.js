import uuid from 'uuid/v4'

module.exports = {
  id: { type: 'string', primary: true, default: uuid },
  url: { type: 'string', uri: true, required: true },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  ownedBy: {
    type: 'relationship',
    relationship: 'OWNED_BY',
    target: 'User',
    direction: 'in',
    eager: true,
    cascade: 'detach',
  },
}
