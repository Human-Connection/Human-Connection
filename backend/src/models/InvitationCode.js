module.exports = {
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  token: { type: 'string', primary: true, token: true },
  generatedBy: {
    type: 'relationship',
    relationship: 'GENERATED',
    target: 'User',
    direction: 'in',
  },
  activated: {
    type: 'relationship',
    relationship: 'ACTIVATED',
    target: 'EmailAddress',
    direction: 'out',
  },
}
