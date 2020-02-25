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
  content: { type: 'string', disallow: [null], min: 3 },
  contentExcerpt: { type: 'string', allow: [null] },
  deleted: { type: 'boolean', default: false },
  disabled: { type: 'boolean', default: false },
  post: {
    type: 'relationship',
    relationship: 'COMMENTS',
    target: 'Post',
    direction: 'out',
  },
  author: {
    type: 'relationship',
    relationship: 'WROTE',
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
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
}
