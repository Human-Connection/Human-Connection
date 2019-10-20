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
          // if this is an embed link or a hashtag, ignore
          tag: 'a[href]:not(.embed):not([data-hashtag-id])',
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
          target: '_blank',
        },
        0,
      ],
    }
  }
}
