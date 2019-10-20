<template>
  <a v-if="showLinkOnly" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
    {{ dataEmbedUrl }}
  </a>
  <ds-container v-else width="small" class="embed-container">
    <section class="embed-content">
      <div v-if="showEmbed" v-html="embedHtml" class="embed-html" />
      <template v-else>
        <img
          v-if="embedHtml && embedImage"
          :src="embedImage"
          class="embed-preview-image embed-preview-image--clickable"
          @click.prevent="openOverlay()"
        />
        <img v-else-if="embedImage" :src="embedImage" class="embed-preview-image" />
      </template>
      <h4 v-if="embedTitle">{{ embedTitle }}</h4>
      <p v-if="embedDescription">{{ embedDescription }}</p>
      <a class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
        {{ dataEmbedUrl }}
      </a>
    </section>
    <aside v-if="showOverlay" class="embed-overlay">
      <h3>{{ $t('editor.embed.data_privacy_warning') }}</h3>
      <ds-text>{{ $t('editor.embed.data_privacy_info') }} {{ embedPublisher }}</ds-text>
      <div class="embed-buttons">
        <ds-button primary @click.prevent="allowEmbed()">
          {{ $t('editor.embed.play_now') }}
        </ds-button>
        <ds-button ghost @click.prevent="closeOverlay()">{{ $t('actions.cancel') }}</ds-button>
      </div>
      <label class="embed-checkbox">
        <input type="checkbox" v-model="checkedAlwaysAllowEmbeds" />
        <span>{{ $t('editor.embed.always_allow') }}</span>
      </label>
    </aside>
    <ds-button
      icon="close"
      ghost
      size="small"
      class="embed-close-button"
      @click.prevent="removeEmbed()"
    />
  </ds-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { allowEmbedIframesMutation } from '~/graphql/User.js'

export default {
  name: 'embed-component',
  props: {
    dataEmbedUrl: {
      type: String,
      default: '',
    },
    embedData: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      checkedAlwaysAllowEmbeds: false,
      showEmbed: false,
      showOverlay: false,
      showLinkOnly: false,
    }
  },
  created() {
    if (this.currentUser.allowEmbedIframes) {
      this.showEmbed = this.currentUser.allowEmbedIframes
      this.checkedAlwaysAllowEmbeds = this.currentUser.allowEmbedIframes
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
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
    allowEmbed() {
      this.showEmbed = true
      this.closeOverlay()

      if (this.checkedAlwaysAllowEmbeds !== this.currentUser.allowEmbedIframes) {
        this.updateEmbedSettings(this.checkedAlwaysAllowEmbeds)
      }
    },
    removeEmbed() {
      this.showLinkOnly = true
    },
    async updateEmbedSettings(allowEmbedIframes) {
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
}
</script>
