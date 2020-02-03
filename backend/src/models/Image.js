export default {
  url: { primary: true, type: 'string', uri: { allowRelative: true } },
  alt: { type: 'string' },
  blurred: { type: 'boolean', default: false },
  aspectRatio: { type: 'float', default: 1.0 },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  urlW1024: { type: 'string', uri: { allowRelative: true } },
  urlW640: { type: 'string', uri: { allowRelative: true } },
  urlW320: { type: 'string', uri: { allowRelative: true } },
  urlW160: { type: 'string', uri: { allowRelative: true } },
  urlW34: { type: 'string', uri: { allowRelative: true } },
}
