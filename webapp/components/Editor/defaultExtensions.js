import Embed from '~/components/Editor/nodes/Embed.js'
import LegacyEmbed from '~/components/Editor/nodes/LegacyEmbed.js'
import Link from '~/components/Editor/nodes/Link.js'
import Strike from '~/components/Editor/marks/Strike'
import Italic from '~/components/Editor/marks/Italic'
import Bold from '~/components/Editor/marks/Bold'
import EmbedQuery from '~/graphql/EmbedQuery.js'
import {
  Heading,
  HardBreak,
  Blockquote,
  ListItem,
  BulletList,
  OrderedList,
  HorizontalRule,
  Placeholder,
  Underline,
} from 'tiptap-extensions'

export default function defaultExtensions(component) {
  const { placeholder, $t, $apollo } = component
  return [
    new Heading(),
    new HardBreak(),
    new Blockquote(),
    new BulletList(),
    new OrderedList(),
    new HorizontalRule(),
    new Bold(),
    new Italic(),
    new Strike(),
    new Underline(),
    new Link(),
    new Heading({ levels: [3, 4] }),
    new ListItem(),
    new Placeholder({
      emptyNodeClass: 'is-empty',
      emptyNodeText: placeholder || $t('editor.placeholder'),
    }),
    new Embed({
      onEmbed: async ({ url }) => {
        const {
          data: { embed },
        } = await $apollo.query({ query: EmbedQuery(), variables: { url } })
        return embed
      },
    }),
    new LegacyEmbed({
      onEmbed: async ({ url }) => {
        const {
          data: { embed },
        } = await $apollo.query({ query: EmbedQuery(), variables: { url } })
        return embed
      },
    }),
  ]
}
