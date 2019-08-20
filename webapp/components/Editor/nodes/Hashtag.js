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
        return [
          'a',
          {
            class: this.options.mentionClass,
            href: `/search/hashtag/${node.attrs.id}`,
            'data-hashtag-id': node.attrs.id,
            target: '_blank',
          },
          `${this.options.matcher.char}${node.attrs.label}`,
        ]
      },
      parseDOM: [
        // simply don't parse mentions from html
        // just treat them as normal links
      ],
    }
  }
}
