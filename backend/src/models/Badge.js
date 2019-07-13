module.exports = {
  id: { type: 'string', primary: true, lowercase: true },
  status: { type: 'string', valid: ['permanent', 'temporary'] },
  type: { type: 'string', valid: ['role', 'crowdfunding'] },
  icon: { type: 'string', required: true },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
}
