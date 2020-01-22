export default {
  id: { type: 'string', primary: true },
  deleted: { type: 'boolean', default: false },
  disabled: { type: 'boolean', default: false },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  post: {
    type: 'relationship',
    relationship: 'TAGGED',
    target: 'Post',
    direction: 'in',
  },
}
