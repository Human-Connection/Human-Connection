export default {
  url: { primary: true, type: 'string', uri: { allowRelative: true } },
  alt: { type: 'string' },
  sensitive: { type: 'boolean', default: false },
  aspectRatio: { type: 'float', default: 1.0 },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
}
