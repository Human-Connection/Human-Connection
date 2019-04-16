import { extractSlugs } from './mentions'

describe('extract', () => {
  describe('searches through links', () => {
    it('ignores links without .mention class', () => {
      const content = '<p>Something inspirational about <a href="/profile/u2" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3" target="_blank">@jenny-rostock</a>.</p>'
      expect(extractSlugs(content)).toEqual([])
    })

    describe('given a link with .mention class', () => {
      const content = '<p>Something inspirational about <a href="/profile/u2" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3/jenny-rostock" class="mention" target="_blank">@jenny-rostock</a>.</p>'

      it('extracts ID', () => {
        expect(extractSlugs(content)).toEqual(['u2', 'u3'])
      })
    })
  })
})
