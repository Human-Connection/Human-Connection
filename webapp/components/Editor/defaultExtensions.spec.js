import defaultExtensions from './defaultExtensions.js'
import { Editor } from 'tiptap'

let content
let createEditor

describe('defaultExtensions', () => {
  describe('editor', () => {
    createEditor = () => {
      const componentStub = {
        placeholder: 'placeholder',
        $t: jest.fn(),
        $apollo: {
          mutate: jest.fn(),
        },
      }
      return new Editor({
        content,
        extensions: [...defaultExtensions(componentStub)],
      })
    }
  })

  it('renders', () => {
    content = ''
    expect(createEditor().getHTML()).toEqual('<p></p>')
  })

  describe('`content` contains a mentioning', () => {
    beforeEach(() => {
      content =
        '<p>This is a post content mentioning <a class="mention" href="/profile/f0628376-e692-4167-bdb4-d521de5a014f" target="_blank">@alicia-luettgen</a>.</p>'
    })

    it('renders mentioning as link', () => {
      const editor = createEditor()
      const expected =
        '<p>This is a post content mentioning <a href="/profile/f0628376-e692-4167-bdb4-d521de5a014f" rel="noopener noreferrer nofollow">@alicia-luettgen</a>.</p>'
      expect(editor.getHTML()).toEqual(expected)
    })
  })

  describe('`content` contains a hashtag', () => {
    beforeEach(() => {
      content =
        '<p>This is a post content with a hashtag <a class="hashtag" href="/search/hashtag/metoo" target="_blank">#metoo</a>.</p>'
    })

    it('renders hashtag as link', () => {
      const editor = createEditor()
      const expected =
        '<p>This is a post content with a hashtag <a href="/search/hashtag/metoo" rel="noopener noreferrer nofollow">#metoo</a>.</p>'
      expect(editor.getHTML()).toEqual(expected)
    })
  })

  describe('`content` contains embed code', () => {
    beforeEach(() => {
      content =
        '<p>Baby loves cat: </p><a href="https://www.youtube.com/watch?v=qkdXAtO40Fo" class="embed" target="_blank"></a>'
    })

    it('recognizes embed code', () => {
      const editor = createEditor()
      const expected = {
        content: [
          {
            content: [
              {
                text: 'Baby loves cat:',
                type: 'text',
              },
            ],
            type: 'paragraph',
          },
          {
            attrs: {
              dataEmbedUrl: 'https://www.youtube.com/watch?v=qkdXAtO40Fo',
            },
            type: 'embed',
          },
        ],
        type: 'doc',
      }
      expect(editor.getJSON()).toEqual(expected)
    })
  })
})
