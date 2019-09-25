import { Node } from 'tiptap'
import pasteRule from '../commands/pasteRule'
import { compileToFunctions } from 'vue-template-compiler'
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

const template = `
  <a class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
    <div v-if="embedHtml" v-html="embedHtml" />
    <em> {{ dataEmbedUrl }} </em>
  </a>
`

const templateVideoPreview = `
<div>
 
  <ds-container width="small">
    <ds-placeholder>
      <div style="font-size: 1em"><span style="color:#17b53f">{{embedPublisher}}</span> - <b>@{{ embedAuthor }}</b> </div>
      <ds-icon
        name="play-circle"
        v-if="!showEmbed"
        style="
          position: absolute;
          font-size: 4em; 
          color:#17b53f;
          border-radius: 67px;
          background-color: cornsilk;
          margin: 80px;
          opacity: 0.9;
          z-index: 1"
      />
      <div style="height:270px">
        <ds-section secondary v-if="showOverlay"  style="height: 270px;width:100%;position:absolute;z-index:1">
          <ds-placeholder>
            Deine Daten sind noch nicht weitergegeben. Wenn Du die das jetzt ansiehst dann werden auch Daten mit dem Anbieter ausgetauscht!
            <ds-button @click="setConfirm">dauerhaft speichern</ds-button>
            <ds-button size="x-large" @click="allowEmbedTemporar('openIframe', embedHtml)" >jetzt ansehen</ds-button>           
          </ds-placeholder>
        </ds-section>
        <ds-section primary v-if="showchangeEmbedStatus"  style="height: 270px;width:100%;position:absolute;z-index:1">
          <ds-placeholder>
            Deine Daten sind noch nicht weitergegeben. Wenn Du die das jetzt ansiehst dann werden auch Daten mit dem Anbieter ausgetauscht!
            <ds-button v-if="!this.currentUser.allowEmbedIframes" @click="setConfirm">dauerhaft speichern</ds-button>
            <ds-button v-if="this.currentUser.allowEmbedIframes" size="x-large" @click="setCancel" >abstellen</ds-button>         
          </ds-placeholder>
        </ds-section>
        <img v-if="!showEmbed"  :src="embedImage" @click="clickPreview"  height="270" width="auto" style="position:absolute" />             
        <div v-if="showEmbed" v-html="embedHtml" />        
      </div>      
      <div style="font-size: 1.5em">{{ embedTitle }}</div>
      <div style="font-size: 1em">{{ embedDescription }}</div>
      <div style="font-size: 1em"><a  :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank" ><em> {{ dataEmbedUrl }} </em></a></div>
      <ds-text v-if="!currentUser.allowEmbedIframes" size="small" align="right" color="softer">
      automatisches Einbinden <b>abgestellt</b> | <a href="#" @click="modalOpen">ändern</a></ds-text>
      <ds-text v-else size="small" align="right" color="softer">
      automatisches Einbinden <b>zugelassen</b> | <a href="#" @click="modalOpen">ändern</a></ds-text>
    </ds-placeholder>
  </ds-container>
</div>
`

const compiledTemplate = compileToFunctions(template)
const compiledTemplateVideoPreview = compileToFunctions(templateVideoPreview)

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
        showEmbed: true,
        showOverlay: false,
        embedcode: null,
        isOpen: false,
        showchangeEmbedStatus: false,
        // allowEmbedIframes: this.currentUser.allowEmbedIframes
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
        embedClass() {
          return this.embedHtml ? 'embed' : ''
        },
        embedHtml() {
          const { html = '' } = this.embedData
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
        clickPreview: function(xx, html) {
          this.showOverlay = true
        },
        allowEmbedTemporar: function(xx, html) {
          if (xx === 'openIframe') {
            this.embedcode = html
            this.showEmbed = true
          } else {
            this.embedcode = null
            this.showEmbed = false
          }
          this.showOverlay = false
        },
        modalOpen: function() {
          this.showOverlay = false
          this.showchangeEmbedStatus = true
        },
        setConfirm: function() {
          this.submit(true)
          this.showOverlay = false
          this.showchangeEmbedStatus = false
        },
        setCancel: function() {
          this.submit(false)
          this.showchangeEmbedStatus = false
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
        if (this.embedHtml !== '')
          return compiledTemplateVideoPreview.render.call(this, createElement)
        if (this.embedHtml === '') return compiledTemplate.render.call(this, createElement)
      },
    }
  }
}
