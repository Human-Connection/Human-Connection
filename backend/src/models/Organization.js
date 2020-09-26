import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  name: { type: 'string', required: true },
  description: { type: 'string', required: false, default: 'Not Assigned' },
  iconName: { type: 'string', required: false, default: 'Not Assigned' },
  urlIcon: { type: 'string', required: false, default: 'Not Assigned' },
  ranking: { type: 'number', required: false, default: 0 },
  hourHand: { type: 'string', required: false, default: 'Not Assigned' },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  services: {
    type: 'relationship',
    relationship: 'PROVIDES',
    target: 'Service',
    direction: 'out',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
  serviceCategories: {
    type: 'relationship',
    relationship: 'SCATEGORIES',
    target: 'ServiceCategory',
    direction: 'out',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
  plan: {
    type: 'relationship',
    relationship: 'SUBSCRIBED',
    target: 'Plan',
    direction: 'out',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
  isIn: {
    type: 'relationship',
    relationship: 'IS_IN',
    target: 'Location',
    direction: 'out',
  },
}
