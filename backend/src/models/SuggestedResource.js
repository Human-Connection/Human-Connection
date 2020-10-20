import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  orgName: { type: 'string', required: false, default: 'Not Assigned' },
  webPage: { type: 'string', required: false, default: 'Not Assigned' },
  location: { type: 'string', required: false, default: 'Not Assigned' },
  phoneNumber: { type: 'string', required: false, default: 'Not Assigned' },
  description: { type: 'string', required: false, default: 'Not Assigned' },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: {
    type: 'string',
    isoDate: true,
    required: true,
    default: () => new Date().toISOString(),
  },
}
