import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  organization: {
    type: 'relationship',
    relationship: 'ATENTIONS',
    target: 'Organization',
    direction: 'out',
  },
  recipient: {
    type: 'relationship',
    relationship: 'RECEIVED',
    target: 'User',
    direction: 'in',
  },
  service: {
    type: 'relationship',
    relationship: 'ASERVICE',
    target: 'Service',
    direction: 'out',
  },
  scategory: {
    type: 'relationship',
    relationship: 'ACATEGORY',
    target: 'ServiceCategory',
    direction: 'out',
  },
}
