import { Node } from 'tiptap'
import Vue from 'vue'
import { compileToFunctions } from 'vue-template-compiler'
import pasteRule from '../commands/pasteRule'
import VideoEmbed from '~/components/Embeds/VideoEmbed'
import ImageEmbed from '~/components/Embeds/ImageEmbed'
import LinkEmbed from '~/components/Embeds/LinkEmbed'
import DefaultEmbed from '~/components/Embeds/DefaultEmbed'

Vue.component(VideoEmbed)
Vue.component(ImageEmbed)
Vue.component(LinkEmbed)
Vue.component(DefaultEmbed)
const template = `
  <div class="embed">
    <component :url="dataEmbedUrl" :embedData="embedData" :is="componentType"/>
  </div>
`
const compiledTemplate = compileToFunctions(template)
export default class Embed extends Node {
  get name() {
    return 'embed'
  }

  get defaultOptions() {
    return {
      onEmbed: () => ({}),
    }
  }

  pasteRules({ type, schema }) {
    return [
      pasteRule(
        // source: https://stackoverflow.com/a/3809435
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g,
        type,
        url => ({ dataEmbedUrl: url }),
      ),
    ]
  }

  get schema() {
    return {
      attrs: {
        dataEmbedUrl: {
          default: null,
        },
      },
      group: 'inline',
      inline: true,
      parseDOM: [
        {
          tag: 'a[href].embed',
          getAttrs: dom => ({
            dataEmbedUrl: dom.getAttribute('href'),
          }),
        },
      ],
      toDOM: node => [
        'a',
        {
          href: node.attrs.dataEmbedUrl,
          class: 'embed',
          target: '_blank',
        },
      ],
    }
  }

  get view() {
    return {
      props: ['node', 'updateAttrs', 'options'],
      data: () => ({
        embedData: {},
      }),
      async created() {
        if (!this.options) return {}
        this.embedData = await this.options.onEmbed({ url: this.dataEmbedUrl })
      },
      computed: {
        componentType() {
          if (this.embedData && this.embedData.type === 'photo') {
            return ImageEmbed
          }
          if (this.embedData && this.embedData.type === 'video') {
            return VideoEmbed
          }
          if (
            (this.embedData && this.embedData.type === 'link') ||
            (this.embedData.publisher && this.embedData.url)
          ) {
            return LinkEmbed
          }
          return DefaultEmbed
        },
        embedClass() {
          return this.embedHtml ? 'embed' : ''
        },
        embedHtml() {
          const { html = '' } = this.embedData
          return html
        },
        dataEmbedUrl: {
          get() {
            return this.node.attrs.dataEmbedUrl
          },
          set(dataEmbedUrl) {
            this.updateAttrs({
              dataEmbedUrl,
            })
          },
        },
      },
      render(createElement) {
        return compiledTemplate.render.call(this, createElement)
      },
    }
  }
}
