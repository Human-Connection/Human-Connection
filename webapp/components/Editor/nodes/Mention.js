import { Node } from 'tiptap'
import { replaceText } from 'tiptap-commands'
import { Mention as TipTapMention } from 'tiptap-extensions'

export default class Mention extends TipTapMention {
  get schema() {
    const schema = super.schema
    schema.attrs = {
      url: {},
      label: {},
    },
    schema.toDOM = node => [
      'a',
      {
        class: this.options.mentionClass,
        href: node.attrs.url,
      },
      `${this.options.matcher.char}${node.attrs.label}`
    ]
    schema.parseDOM = [
      // this is not implemented
    ]
    return schema
  }
}
