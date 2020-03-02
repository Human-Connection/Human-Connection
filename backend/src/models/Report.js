import { v4 as uuid } from 'uuid'

export default {
  id: { type: 'string', primary: true, default: uuid },
  createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
  rule: { type: 'string', default: 'latestReviewUpdatedAtRules' },
  closed: { type: 'boolean', default: false },
  belongsTo: {
    type: 'relationship',
    relationship: 'BELONGS_TO',
    target: ['User', 'Comment', 'Post'],
    direction: 'out',
  },
  filed: {
    type: 'relationship',
    relationship: 'FILED',
    target: 'User',
    direction: 'in',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      resourceId: { type: 'string', primary: true, default: uuid },
      reasonCategory: {
        type: 'string',
        valid: [
          'other',
          'discrimination_etc',
          'pornographic_content_links',
          'glorific_trivia_of_cruel_inhuman_acts',
          'doxing',
          'intentional_intimidation_stalking_persecution',
          'advert_products_services_commercial',
          'criminal_behavior_violation_german_law',
        ],
        invalid: [null],
      },
      reasonDescription: { type: 'string', allow: [null] },
    },
  },
  reviewed: {
    type: 'relationship',
    relationship: 'REVIEWED',
    target: 'User',
    direction: 'in',
    properties: {
      createdAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      updatedAt: { type: 'string', isoDate: true, default: () => new Date().toISOString() },
      disable: { type: 'boolean', default: false },
      closed: { type: 'boolean', default: false },
    },
  },
}
