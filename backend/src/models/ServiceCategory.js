import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  name: { type: 'string', required: true, default: false },
  icon: { type: 'string', required: false, default: 'default' },
  order: { type: 'number', required: false },
  classification: { type: 'string', required: false },
  description: { type: 'string', required: false },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  services: {
    type: 'relationship',
    relationship: 'DENOMINATION',
    target: 'Service',
    direction: 'out',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
  organizations: {
    type: 'relationship',
    relationship: 'SCATEGORY',
    target: 'Organization',
    direction: 'out',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
}
