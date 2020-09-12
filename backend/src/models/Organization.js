import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  activityId: { type: 'string', allow: [null] },
  objectId: { type: 'string', allow: [null] },
  image: {
    type: 'relationship',
    relationship: 'HERO_IMAGE',
    target: 'Image',
    direction: 'out',
  },
  creator: {
    type: 'relationship',
    relationship: 'CREATED',
    target: 'User',
    direction: 'in',
  },
  name: { type: 'string', disallow: [null], min: 3 },
  slug: { type: 'string', allow: [null], unique: 'true' },
  description: { type: 'string', disallow: [null], min: 3 },
  email: { type: 'string', allow: [null] },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
  locationName: { type: 'string', allow: [null] },
  isIn: {
    type: 'relationship',
    relationship: 'IS_IN',
    target: 'Location',
    direction: 'out',
  },
}
