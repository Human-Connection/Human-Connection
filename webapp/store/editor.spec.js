import { getters, mutations } from './editor.js'

let state

describe('getters', () => {
  describe('placeholder', () => {
    it('return the value in state', () => {
      state = { placeholder: null }
      expect(getters.placeholder(state)).toBe(null)
    })
  })
})

describe('mutations', () => {
  it('SET_PLACEHOLDER_TEXT', () => {
    state = { placeholder: null }
    mutations.SET_PLACEHOLDER_TEXT(state, 'new placeholder')
    expect(getters.placeholder(state)).toBe('new placeholder')
  })
})
