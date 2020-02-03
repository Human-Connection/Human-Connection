export default {
  url: { primary: true, type: 'string', uri: { allowRelative: true } },
  alt: { type: 'string' },
  blurred: { type: 'boolean', default: false },
  aspectRatio: { type: 'float', default: 1.0 },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  w1024: { type: 'string', uri: { allowRelative: true } },
  w640: { type: 'string', uri: { allowRelative: true } },
  w320: { type: 'string', uri: { allowRelative: true } },
  w160: { type: 'string', uri: { allowRelative: true } },
  w34: { type: 'string', uri: { allowRelative: true } },
}
