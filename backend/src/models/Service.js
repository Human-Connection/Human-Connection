import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  name: { type: 'string', required: true, default: false },
  description: { type: 'string', required: false, default: 'Not Assigned' },
  isGeneral: { type: 'boolean', default: false },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  organization: {
    type: 'relationship',
    relationship: 'BELONGS',
    target: 'Organization',
    direction: 'out',
  },
  serviceCategory: {
    type: 'relationship',
    relationship: 'CATEGORY',
    target: 'ServiceCategory',
    direction: 'out',
  },
}
