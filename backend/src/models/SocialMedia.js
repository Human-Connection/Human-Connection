import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  url: { type: 'string', uri: true, required: true },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  ownedBy: {
    type: 'relationship',
    relationship: 'OWNED_BY',
    target: 'User',
    direction: 'out',
    eager: true,
    cascade: 'detach',
  },
}
