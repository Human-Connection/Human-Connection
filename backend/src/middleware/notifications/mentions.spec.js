import { extractSlugs } from './mentions'

describe('extract', () => {
  describe('finds mentions in the form of', () => {
    it('@user', () => {
      const content = 'Hello @user'
      expect(extractSlugs(content)).toEqual(['user'])
    })
  })

  it('ignores email addresses', () => {
      const content = 'Hello somebody@example.org'
      expect(extractSlugs(content)).toEqual([])
  })
})
