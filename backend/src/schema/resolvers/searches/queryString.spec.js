import { queryString, escapeSpecialCharacters, normalizeWhitespace } from './queryString'

describe('queryString', () => {
  describe('special characters', () => {
    it('does escaping correctly', () => {
      expect(escapeSpecialCharacters('+ - && || ! ( ) { } [ ] ^ " ~ * ? : \\ / ')).toEqual(
        '\\+ \\- \\&\\& \\|\\| \\! \\( \\) \\{ \\} \\[ \\] \\^ \\" \\~ \\* \\? \\: \\\\ \\/ ',
      )
    })
  })

  describe('whitespace', () => {
    it('normalizes correctly', () => {
      expect(normalizeWhitespace(' a \t \n b \n   ')).toEqual('a b')
    })
  })

  describe('exact match', () => {
    it('boosts score by factor 8', () => {
      expect(queryString('a couple of words')).toContain('"a couple of words"^8')
    })
  })

  describe('match all words exactly', () => {
    it('boosts score by factor 4', () => {
      expect(queryString('a couple of words')).toContain(
        '("a" AND "couple" AND "of" AND "words")^4',
      )
    })
  })

  describe('match at least one word exactly', () => {
    it('boosts score by factor 2', () => {
      expect(queryString('a couple of words')).toContain('"a"^2 "couple"^2 "of"^2 "words"^2')
    })
  })

  describe('globbing for longer words', () => {
    it('globs words with more than three characters', () => {
      expect(queryString('a couple of words')).toContain('couple* words*')
    })
  })
})
