import { describe, it } from 'mocha'

describe('query', () => {
  describe('statistics', () => {
    describe('authenticated user', () => {
      describe('read', () => {
        it('is forbidden')
      })
    })

    describe('admin', () => {
      describe('read', () => {
        it('is permitted')
      })
    })
  })
})
