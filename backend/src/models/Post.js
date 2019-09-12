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
  notified: {
    type: 'relationship',
    relationship: 'NOTIFIED',
    target: 'User',
    direction: 'out',
    properties: {
      read: { type: 'boolean', default: false },
      reason: {
        type: 'string',
        valid: ['mentioned_in_post', 'mentioned_in_comment', 'commented_on_post'],
      },
      createdAt: { type: 'datetime', default: () => new Date() },
    },
  },
  createdAt: { type: 'datetime', default: () => new Date() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  language: { type: 'string', allow: [null] },
}
