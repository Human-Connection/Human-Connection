import uuid from 'uuid/v4'

export default {
  id: { type: 'string', primary: true, default: uuid },
  activityId: { type: 'string', allow: [null] },
  objectId: { type: 'string', allow: [null] },
  image: {
    type: 'relationship',
    relationship: 'TEASER_IMAGE',
    target: 'Image',
    direction: 'out',
  },
  author: {
    type: 'relationship',
    relationship: 'WROTE',
    target: 'User',
    direction: 'in',
  },
  title: { type: 'string', disallow: [null], min: 3 },
  slug: { type: 'string', allow: [null], unique: 'true' },
  content: { type: 'string', disallow: [null], min: 3 },
  contentExcerpt: { type: 'string', allow: [null] },
  deleted: { type: 'boolean', default: false },
  disabled: { type: 'boolean', default: false },
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
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  language: { type: 'string', allow: [null] },
  comments: {
    type: 'relationship',
    relationship: 'COMMENTS',
    target: 'Comment',
    direction: 'in',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
    },
  },
  pinned: { type: 'boolean', default: null, valid: [null, true] },
}
