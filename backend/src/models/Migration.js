export default {
  title: { type: 'string', primary: true, token: true },
  description: { type: 'string' },
  migratedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
}
