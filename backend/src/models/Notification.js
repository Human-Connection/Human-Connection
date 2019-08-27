import uuid from 'uuid/v4'

module.exports = {
  id: {
    type: 'uuid',
    primary: true,
    default: uuid,
  },
  read: {
    type: 'boolean',
    default: false,
  },
  reason: {
    type: 'string',
    valid: ['mentioned_in_post', 'mentioned_in_comment', 'comment_on_post'],
    invalid: [null],
    default: 'mentioned_in_post',
  },
  createdAt: {
    type: 'string',
    isoDate: true,
    default: () => new Date().toISOString(),
  },
  user: {
    type: 'relationship',
    relationship: 'NOTIFIED',
    target: 'User',
    direction: 'out',
  },
  post: {
    type: 'relationship',
    relationship: 'NOTIFIED',
    target: 'Post',
    direction: 'in',
  },
}
