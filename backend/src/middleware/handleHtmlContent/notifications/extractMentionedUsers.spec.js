import extractIds from './extractMentionedUsers'

describe('extractIds', () => {
  describe('content undefined', () => {
    it('returns empty array', () => {
      expect(extractIds()).toEqual([])
    })
  })

  describe('searches through links', () => {
    it('ignores links without .mention class', () => {
      const content =
        '<p>Something inspirational about <a href="/profile/u2" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3" target="_blank">@jenny-rostock</a>.</p>'
      expect(extractIds(content)).toEqual([])
    })

    describe('given a link with .mention class', () => {
      it('extracts ids', () => {
        const content =
          '<p>Something inspirational about <a href="/profile/u2" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3/jenny-rostock" class="mention" target="_blank">@jenny-rostock</a>.</p>'
        expect(extractIds(content)).toEqual(['u2', 'u3'])
      })

      describe('handles links', () => {
        it('with slug and id', () => {
          const content =
            '<p>Something inspirational about <a href="/profile/u2/bob-der-baumeister" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3/jenny-rostock/" class="mention" target="_blank">@jenny-rostock</a>.</p>'
          expect(extractIds(content)).toEqual(['u2', 'u3'])
        })

        it('with domains', () => {
          const content =
            '<p>Something inspirational about <a href="http://localhost:3000/profile/u2/bob-der-baumeister" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="http://localhost:3000//profile/u3/jenny-rostock/" class="mention" target="_blank">@jenny-rostock</a>.</p>'
          expect(extractIds(content)).toEqual(['u2', 'u3'])
        })

        it('special characters', () => {
          const content =
            '<p>Something inspirational about <a href="http://localhost:3000/profile/u!*(),2/bob-der-baumeister" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="http://localhost:3000//profile/u.~-3/jenny-rostock/" class="mention" target="_blank">@jenny-rostock</a>.</p>'
          expect(extractIds(content)).toEqual(['u!*(),2', 'u.~-3'])
        })
      })

      describe('does not crash if', () => {
        it('`href` contains no user id', () => {
          const content =
            '<p>Something inspirational about <a href="/profile" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="/profile/" class="mention" target="_blank">@jenny-rostock</a>.</p>'
          expect(extractIds(content)).toEqual([])
        })

        it('`href` is empty or invalid', () => {
          const content =
            '<p>Something inspirational about <a href="" class="mention" target="_blank">@bob-der-baumeister</a> and <a href="not-a-url" class="mention" target="_blank">@jenny-rostock</a>.</p>'
          expect(extractIds(content)).toEqual([])
        })
      })
    })
  })
})