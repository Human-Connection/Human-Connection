export default {
  title: { type: 'string', primary: true, token: true },
  description: { type: 'string' },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
}
