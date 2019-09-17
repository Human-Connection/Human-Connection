import extractHashtags from './extractHashtags'

describe('extractHashtags', () => {
  describe('content undefined', () => {
    it('returns empty array', () => {
      expect(extractHashtags()).toEqual([])
    })
  })

  describe('searches through links', () => {
    it('without `class="hashtag"` but `data-hashtag-id="something"`, and extracts the Hashtag to make a Hashtag link', () => {
      const content = `
        <p>
          <a
            class="hashtag"
            data-hashtag-id="Elections"
            href="/?hashtag=Elections"
          >
            #Elections
          </a>
          <a
            data-hashtag-id="Democracy"
            href="/?hashtag=Democracy"
          >
            #Democracy
          </a>
        </p>
      `
      expect(extractHashtags(content)).toEqual(['Elections', 'Democracy'])
    })

    it('ignores mentions', () => {
      const content =
        '<p>Something inspirational about <a href="/profile/u2" target="_blank">@bob-der-baumeister</a> and <a href="/profile/u3/jenny-rostock" class="mention" target="_blank">@jenny-rostock</a>.</p>'
      expect(extractHashtags(content)).toEqual([])
    })

    it('ignores hashtag links with unsupported character combinations', () => {
      // Allowed are all unicode letters '\pL' and all digits '0-9'. There haveto be at least one letter in it.
      const content = `
      <p>
        Something inspirational about
        <a
          href="/?hashtag=AbcDefXyz0123456789!*(),2"
          data-hashtag-id="AbcDefXyz0123456789!*(),2"
          class="hashtag"
          target="_blank"
        >
          #AbcDefXyz0123456789!*(),2
        </a>,
        <a
          href="/?hashtag=0123456789"
          data-hashtag-id="0123456789"
          class="hashtag"
          target="_blank"
        >
          #0123456789
        </a>,
        <a href="?hashtag=0123456789a"
          data-hashtag-id="0123456789a"
          class="hashtag"
          target="_blank"
        >
          #0123456789a
        </a>,
        <a
          href="/?hashtag=AbcDefXyz0123456789"
          data-hashtag-id="AbcDefXyz0123456789"
          class="hashtag"
          target="_blank"
        >
          #AbcDefXyz0123456789
        </a>, and
        <a
          href="/?hashtag=%C4%A7%CF%80%CE%B1%CE%BB"
          data-hashtag-id="ħπαλ"
          class="hashtag"
          target="_blank"
        >
          #ħπαλ
        </a>.
      </p>
      `
      expect(extractHashtags(content).sort()).toEqual([
        '0123456789a',
        'AbcDefXyz0123456789',
        'ħπαλ',
      ])
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
