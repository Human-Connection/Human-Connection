import uuid from 'uuid/v4'

module.exports = {
  id: { type: 'string', primary: true, default: uuid },
  activityId: { type: 'string', allow: [null] },
  objectId: { type: 'string', allow: [null] },
  author: {
    type: 'relationship',
    relationship: 'WROTE',
    target: 'User',
    direction: 'in',
  },
  title: { type: 'string', disallow: [null], min: 3 },
  slug: { type: 'string', allow: [null] },
  content: { type: 'string', disallow: [null], min: 3 },
  contentExcerpt: { type: 'string', allow: [null] },
  image: { type: 'string', allow: [null] },
  deleted: { type: 'boolean', default: false },
  disabled: { type: 'boolean', default: false },
  disabledBy: {
    type: 'relationship',
    relationship: 'DISABLED',
    target: 'User',
    direction: 'in',
  },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  language: { type: 'string', allow: [null] },
}
