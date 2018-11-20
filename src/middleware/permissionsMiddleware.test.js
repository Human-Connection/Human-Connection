import { describe, it } from 'mocha'
import { expect } from 'chai'


describe('query', () => {
  describe('statistics', () => {
    describe('authenticated user', () => {
      describe('read', () => {
        it('is forbidden', () => {
        })
      })
    })

    context('admin', () => {
      describe('read', () => {
        it('is permitted', () => {
        })
      })
    })
  })
})
