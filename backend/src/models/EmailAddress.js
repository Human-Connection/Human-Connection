module.exports = {
  email: { type: 'string', primary: true, lowercase: true, email: true },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  verifiedAt: { type: 'string', isoDate: true },
  nonce: { type: 'string', token: true },
  belongsTo: {
    type: 'relationship',
    relationship: 'BELONGS_TO',
    target: 'User',
    direction: 'out',
    eager: true,
  },
}
