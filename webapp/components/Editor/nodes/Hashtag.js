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
    const patchedSchema = super.schema

    patchedSchema.attrs = {
      url: {},
      label: {},
    }
    patchedSchema.toDOM = node => {
      return [
        'a',
        {
          class: this.options.mentionClass,
          href: node.attrs.url,
          target: '_blank',
          // contenteditable: 'true',
        },
        `${this.options.matcher.char}${node.attrs.label}`,
      ]
    }
    patchedSchema.parseDOM = [
      // this is not implemented
    ]
    return patchedSchema
  }
}
