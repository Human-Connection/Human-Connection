import { Mention as TipTapMention } from 'tiptap-extensions'

export default class Hashtag extends TipTapMention {
  get name() {
    return 'hashtag'
  }

  get defaultOptions() {
    return {
      matcher: {
        char: '#',
        allowSpaces: false,
        startOfLine: false,
      },
      mentionClass: 'hashtag',
      suggestionClass: 'hashtag-suggestion',
    }
  }

  get schema() {
    return {
      ...super.schema,
      toDOM: node => {
        // use a dummy domain because URL cannot handle relative urls
        const url = new URL('/', 'https://human-connection.org')
        url.searchParams.append('hashtag', node.attrs.id)

        return [
          'a',
          {
            class: this.options.mentionClass,
            href: `/${url.search}`,
            'data-hashtag-id': node.attrs.id,
            target: '_blank',
          },
          `${this.options.matcher.char}${node.attrs.label}`,
        ]
      },
      parseDOM: [
        {
          tag: 'a[data-hashtag-id]',
          getAttrs: dom => {
            const id = dom.getAttribute('data-hashtag-id')
            const label = dom.innerText.split(this.options.matcher.char).join('')
            return { id, label }
          },
        },
      ],
    }
  }
}
