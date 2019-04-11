import { extractSlugs } from './mentions'

describe('extract', () => {
  describe('finds mentions in the form of', () => {
    it('@user', () => {
      const content = 'Hello @user'
      expect(extractSlugs(content)).toEqual(['user'])
    })

    it('@user-with-dash', () => {
      const content = 'Hello @user-with-dash'
      expect(extractSlugs(content)).toEqual(['user-with-dash'])
    })

    it('@user.', () => {
      const content = 'Hello @user.'
      expect(extractSlugs(content)).toEqual(['user'])
    })

    it('@user-With-Capital-LETTERS', () => {
      const content = 'Hello @user-With-Capital-LETTERS'
      expect(extractSlugs(content)).toEqual(['user-With-Capital-LETTERS'])
    })
  })

  it('ignores email addresses', () => {
    const content = 'Hello somebody@example.org'
    expect(extractSlugs(content)).toEqual([])
  })
})
