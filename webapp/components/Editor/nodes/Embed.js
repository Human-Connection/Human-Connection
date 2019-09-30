import { Node } from 'tiptap'
import pasteRule from '../commands/pasteRule'
import { compileToFunctions } from 'vue-template-compiler'
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

const template = `
  
    <a  class="embed" :href="dataEmbedUrl" style="cursor: none">
      <ds-container width="medium">
        <ds-section secondary v-if="showOverlay"  style="height: 270px;width:92%;position:absolute;z-index:3">
          <ds-text>Deine Daten sind noch nicht weitergegeben. Wenn Du die das jetzt ansiehst dann werden auch Daten mit dem Anbieter ({{embedPublisher}}) ausgetauscht!</ds-text>
          <ds-button size="x-large" @click.prevent="allowEmbedTemporar('openIframe')" >jetzt ansehen</ds-button>      
          <ds-text v-if="!currentUser.allowEmbedIframes" size="small" align="right" color="softer">
            automatisches Einbinden <b>zulassen?</b> | 
          </ds-text>
          <ds-text v-else size="small" align="right" color="softer">
            automatisches Einbinden <b>zugelassen</b> | 
          </ds-text>   
          <input type="checkbox" v-model="currentUser.allowEmbedIframes"  @click.prevent="check($event)">  
        </ds-section>
        <p v-if="!showEmbed || linkOnly" style="cursor: pointer" >
          <img :src="embedImage" alt="dataEmbedUrl"  @click.prevent="clickPreview" height="270" width="auto" />
        <div v-else v-html="embedHtml" />
        <p style="color:black">
        <div style="font-size: 1.5em">{{ embedTitle }}</div>
        <div style="font-size: 1em">{{ embedDescription }}</div>
        <a  class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank"  >
          <em> {{ dataEmbedUrl }} </em>
        </a>
      </ds-container>
    </a>
`

const compiledTemplate = compileToFunctions(template)

export default class Embed extends Node {
  get name() {
    return 'embedUrl'
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
        showEmbed: true,
        showOverlay: false,
        linkOnly: false,
      }),
      async created() {
        if (!this.options) return {}
        this.embedData = await this.options.onEmbed({ url: this.dataEmbedUrl })
        this.showEmbed = this.currentUser.allowEmbedIframes
      },
      computed: {
        ...mapGetters({
          currentUser: 'auth/user',
        }),
        embedHtml() {
          const { html = '' } = this.embedData
          if (html === '') {
            this.linkOnly = true
          } else {
            this.linkOnly = false
          }
          return html
        },
        embedImage() {
          const { image = '' } = this.embedData
          return image
        },
        embedPublisher() {
          const { publisher = '' } = this.embedData
          return publisher
        },
        embedTitle() {
          const { title = '' } = this.embedData
          return title
        },
        embedAuthor() {
          const { author = '' } = this.embedData
          return author
        },
        embedDescription() {
          const { description = '' } = this.embedData
          return description
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
      methods: {
        ...mapMutations({
          setCurrentUser: 'auth/SET_USER',
        }),
        clickPreview() {
          this.showOverlay = true
        },
        allowEmbedTemporar(xx) {
          if (xx === 'openIframe') {
            this.showEmbed = true
            this.showOverlay = false
          } else {
            this.showEmbed = false
            this.showOverlay = true
          }
        },
        check(e) {
          if (e.target.checked) {
            this.submit(true)
          } else {
            this.submit(false)
          }
          this.showOverlay = false
        },
        async submit(allowEmbedIframes) {
          try {
            await this.$apollo.mutate({
              mutation: allowEmbedIframesMutation(),
              variables: {
                id: this.currentUser.id,
                allowEmbedIframes,
              },
              update: (store, { data: { UpdateUser } }) => {
                const { allowEmbedIframes } = UpdateUser
                this.setCurrentUser({
                  ...this.currentUser,
                  allowEmbedIframes,
                })
              },
            })
            this.$toast.success(this.$t('contribution.success'))
            this.showEmbed = this.currentUser.allowEmbedIframes
          } catch (err) {
            this.$toast.error(err.message)
          }
        },
      },
      render(createElement) {
        return compiledTemplate.render.call(this, createElement)
      },
    }
  }
}
