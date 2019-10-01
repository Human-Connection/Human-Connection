import { Node } from 'tiptap'
import pasteRule from '../commands/pasteRule'
import { compileToFunctions } from 'vue-template-compiler'
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

const template = `  
    <a  class="embed" href="" style="cursor: none">
      <ds-container width="small">
        <ds-section secondary v-if="showOverlay"  style="height: 270px;width:80%;position:absolute;z-index:3">
          <ds-text v-if="!isOnlyLink">Deine Daten sind noch nicht weitergegeben. Wenn Du die das jetzt ansiehst dann werden auch Daten mit dem Anbieter ({{embedPublisher}}) ausgetauscht!</ds-text>
          <ds-text v-else >Du verlässt jetzt Human Connection! Du wirst zu ({{embedPublisher}}) weitergeleitet!</ds-text>
          <ds-button v-if="!isOnlyLink" size="x-large" @click.prevent="allowEmbedTemporar('openIframe')" >jetzt ansehen</ds-button>
          <ds-button  v-else size="x-large" > <a :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank" >Webseite aufrufen   </a>  </ds-button>
          <p v-show="!isOnlyLink">      
          <input type="checkbox" v-model="currentUser.allowEmbedIframes" @click.prevent="check($event)" id="dataEmbedUrl" />
      
            <lable v-if="!currentUser.allowEmbedIframes" for="dataEmbedUrl" size="small">
              automatisches Einbinden <b>zulassen?</b> |
            </lable>
            <lable v-else size="small" for="dataEmbedUrl" >
              automatisches Einbinden <b>zugelassen</b> |
            </lable>
          </p>
        </ds-section>
        <img  v-show="showPreviewImage" style="cursor: pointer"  :src="embedImage" alt="dataEmbedUrl"  @click.prevent="clickPreview" height="270" width="auto" />
         <div v-show="!showPreviewImage" v-html="embedHtml" />
        <p style="color:black">
        <div >{{ embedTitle }}</div>
        <div>{{ embedDescription }}</div>
        <a  :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank"  >
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
        showPreviewImage: true,
        showEmbed: null,
        showOverlay: null,
        isOnlyLink: false,
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
          if (this.embedData.html === null) {
            this.isOnlyLink = true
          }

          if (this.showEmbed && !this.isOnlyLink) {
            this.showPreviewImage = false
          }

          if (!this.showEmbed && this.isOnlyLink) {
            this.showPreviewImage = true
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
        check(e) {
          if (e.target.checked) {
            this.submit(true)
          } else {
            this.submit(false)
          }
          this.showOverlay = false
        },
        allowEmbedTemporar(xx) {
          if (!this.isOnlyLink) {
            this.showEmbed = true
            this.showOverlay = false
          } else {
            this.showEmbed = false
            this.showOverlay = false
          }
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
