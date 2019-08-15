import uuid from 'uuid/v4'

module.exports = {
  id: { type: 'uuid', primary: true, default: uuid },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  read: { type: 'boolean', default: false },
  user: {
    type: 'relationship',
    relationship: 'NOTIFIED',
    target: 'User',
    direction: 'out',
  },
  post: {
    type: 'relationship',
    relationship: 'NOTIFIED',
    target: 'Post',
    direction: 'in',
  },
}
