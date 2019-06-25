import { Node } from 'tiptap'

export default class Embed extends Node {
  get name() {
    return 'embed'
  }

  get schema() {
    return {
      attrs: {
        href: {
          default: null,
        },
      },
      group: 'block',
      selectable: false,
      parseDOM: [
        {
          tag: 'a[class=embed]',
          getAttrs: dom => ({
            href: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          class: 'embed',
          href: node.attrs.href,
        },
      ],
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'view'],
      data: () => ({
        title: 'Link Title',
        description: 'Some Link Description text which talks a bit about the link.',
      }),
      computed: {
        href: {
          get() {
            return this.node.attrs.href
          },
          set(href) {
            this.updateAttrs({
              href,
            })
          },
        },
      },
      template: `
        <a class="embed"><h4>{{ title }}</h4><p>{{ description }}</p><em>{{ href }}</em></a>
      `,
    }
  }
}
