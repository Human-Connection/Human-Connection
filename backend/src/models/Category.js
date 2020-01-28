import uuid from 'uuid/v4'

export default {
  id: { type: 'string', primary: true, default: uuid },
  name: { type: 'string', required: true, default: false },
  slug: { type: 'string', unique: 'true' },
  icon: { type: 'string', required: true, default: false },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  post: {
    type: 'relationship',
    relationship: 'CATEGORIZED',
    target: 'Post',
    direction: 'in',
  },
}
