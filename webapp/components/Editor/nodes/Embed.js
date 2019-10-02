import { Node } from 'tiptap'
import pasteRule from '../commands/pasteRule'
import { compileToFunctions } from 'vue-template-compiler'
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

const template = `
  <ds-container width="small" class="embed-container">
    <section @click.prevent="openOverlay()" class="embed-content">
      <div v-if="!showPreviewImage" v-html="embedHtml" class="embed-html" />
      <img v-else :src="embedImage" class="embed-preview-image" />
      <h4>{{embedTitle}}</h4>
      <p>{{embedDescription}}</p>
      <a class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">{{dataEmbedUrl}}</a>
    </section>
    <aside v-if="showOverlay" class="embed-overlay">
      <h3>Achte auf deine Daten!</h3>
      <ds-text>Deine Daten sind noch nicht weitergegeben. Wenn Du die das jetzt ansiehst dann werden auch Daten mit dem Anbieter ({{embedPublisher}}) ausgetauscht!</ds-text>
      <div class="embed-buttons">
      <ds-button primary @click.prevent="allowEmbedTemporar('openIframe')">jetzt ansehen</ds-button>
      <ds-button ghost @click.prevent="closeOverlay()">Abbrechen</ds-button>
      </div>
      <label class="embed-checkbox">
        <input type="checkbox" v-model="currentUser.allowEmbedIframes" @click.prevent="check($event)" />
        <span>Inhalte von Drittanbietern immer zulassen</span>
      </label>
    </aside>
  </ds-container>
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
        showOverlay: false,
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
        openOverlay() {
          this.showOverlay = true
        },
        closeOverlay() {
          this.showOverlay = false
        },
        check(e) {
          if (e.target.checked) {
            this.submit(true)
          } else {
            this.submit(false)
          }
        },
        allowEmbedTemporar(xx) {
          if (!this.isOnlyLink) {
            this.showEmbed = true
          } else {
            this.showEmbed = false
          }
          this.closeOverlay()
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
