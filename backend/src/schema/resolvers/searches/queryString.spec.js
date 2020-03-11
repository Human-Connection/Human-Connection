import queryString from './queryString'

describe('queryString', () => {
  describe('exact match', () => {
    it.skip('boosts score by factor 8', () => {
      expect(queryString('a couple of words')).toContain('"a couple of words"^8')
    })
    it.todo('implement more cases here')
  })
})
