import { createTestClient } from 'apollo-server-testing'
import createServer from '../../../server'
import { gql } from '../../../jest/helpers'

describe('blockedUsers', () => {
  it.todo('throws permission error')

  describe('authenticated', () => {
  it.todo('returns a list of blocked users')
  })
})

describe('block', () => {
  it.todo('throws permission error')

  describe('authenticated', () => {
    it.todo('throws argument error')

    describe('given a to-be-blocked user', () => {
      it.todo('blocks a user')

      describe('blocked user writes a post', () => {
        it.todo('disappears in the newsfeed of the current user')
      })

      describe('current user writes a post', () => {
        it.todo('disappears in the newsfeed of the blocked user')
      })
    })
  })
})

describe('unblock', () => {
  it.todo('throws permission error')
  describe('authenticated', () => {
    it.todo('throws argument error')
    describe('given a blocked user', () => {
      it.todo('unblocks a user')
      describe('unblocking twice', () => {
        it.todo('has no effect')
      })
    })
  })
})
