import extractHashtags from './extractHashtags'

describe('extractHashtags', () => {
  describe('content undefined', () => {
    it('returns empty array', () => {
      expect(extractHashtags()).toEqual([])
    })
  })

  describe('searches through links', () => {
    it('finds links with and without ".hashtag" class and extracts Hashtag names', () => {
      const content =
        '<p><a class="hashtag" href="/search/hashtag/Elections">#Elections</a><a href="/search/hashtag/Democracy">#Democracy</a></p>'
      expect(extractHashtags(content)).toEqual(['Elections', 'Democracy'])
    })

    it('ignores mentions', () => {
      const content =
        '<p>Something inspirational about <a href="/profile/u2" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3/jenny-rostock" class="mention" target="_blank">@jenny-rostock</a>.</p>'
      expect(extractHashtags(content)).toEqual([])
    })

    describe('handles links', () => {
      it('ignores links with domains', () => {
        const content =
          '<p><a class="hashtag" href="http://localhost:3000/search/hashtag/Elections">#Elections</a><a href="/search/hashtag/Democracy">#Democracy</a></p>'
        expect(extractHashtags(content)).toEqual(['Democracy'])
      })

      it('ignores Hashtag links with not allowed character combinations', () => {
        const content =
          '<p>Something inspirational about <a href="/search/hashtag/AbcDefXyz0123456789!*(),2" class="hashtag" target="_blank">#AbcDefXyz0123456789!*(),2</a>, <a href="/search/hashtag/0123456789" class="hashtag" target="_blank">#0123456789</a>, <a href="/search/hashtag/0123456789a" class="hashtag" target="_blank">#0123456789a</a> and <a href="/search/hashtag/AbcDefXyz0123456789" target="_blank">#AbcDefXyz0123456789</a>.</p>'
        expect(extractHashtags(content)).toEqual(['0123456789a', 'AbcDefXyz0123456789'])
      })
    })

    describe('does not crash if', () => {
      it('`href` contains no Hashtag name', () => {
        const content =
          '<p>Something inspirational about <a href="/search/hashtag/" target="_blank">#Democracy</a> and <a href="/search/hashtag" target="_blank">#liberty</a>.</p>'
        expect(extractHashtags(content)).toEqual([])
      })

      it('`href` contains Hashtag as page anchor', () => {
        const content =
          '<p>Something inspirational about <a href="https://www.example.org/#anchor" target="_blank">#anchor</a>.</p>'
        expect(extractHashtags(content)).toEqual([])
      })

      it('`href` is empty or invalid', () => {
        const content =
          '<p>Something inspirational about <a href="" class="hashtag" target="_blank">@bob-der-baumeister</a> and <a href="not-a-url" target="_blank">@jenny-rostock</a>.</p>'
        expect(extractHashtags(content)).toEqual([])
      })
    })
  })
})
