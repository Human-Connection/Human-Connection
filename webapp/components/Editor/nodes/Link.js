import { Link as TipTapLink } from 'tiptap-extensions'

export default class Link extends TipTapLink {
  pasteRules({ type }) {
    return []
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      inclusive: false,
      parseDOM: [
        {
          tag: 'a[href]:not(.embed)', // do not trigger on embed links
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          ...node.attrs,
          rel: 'noopener noreferrer nofollow',
        },
        0,
      ],
    }
  }
}
