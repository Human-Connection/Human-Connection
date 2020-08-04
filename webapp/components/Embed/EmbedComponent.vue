<template>
  <a v-if="showLinkOnly" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
    {{ dataEmbedUrl }}
  </a>
  <ds-container v-else width="small" class="embed-component">
    <section class="content">
      <div v-if="showEmbed" v-html="embedHtml" class="html" />
      <template v-else>
        <img
          v-if="embedHtml && embedImage"
          :src="embedImage"
          class="preview --clickable"
          @click.prevent="openOverlay()"
        />
        <img v-else-if="embedImage" :src="embedImage" class="preview" />
      </template>
      <h4 v-if="embedTitle">{{ embedTitle }}</h4>
      <p v-if="embedDescription">{{ embedDescription }}</p>
      <a class="embed" :href="dataEmbedUrl" rel="noopener noreferrer nofollow" target="_blank">
        {{ dataEmbedUrl }}
      </a>
    </section>
    <aside v-if="showOverlay" class="overlay">
      <h3>{{ $t('editor.embed.data_privacy_warning') }}</h3>
      <ds-text>{{ $t('editor.embed.data_privacy_info') }} {{ embedPublisher }}</ds-text>
      <div class="buttons">
        <base-button @click="closeOverlay()" data-test="cancel-button" danger>
          {{ $t('actions.cancel') }}
        </base-button>
        <base-button @click="allowEmbed()" data-test="play-now-button" filled>
          {{ $t('editor.embed.play_now') }}
        </base-button>
      </div>
      <label class="checkbox">
        <input type="checkbox" v-model="checkedAlwaysAllowEmbeds" />
        <span>{{ $t('editor.embed.always_allow') }}</span>
      </label>
    </aside>
    <base-button
      icon="close"
      size="small"
      circle
      class="close-button"
      @click.prevent="removeEmbed()"
    />
  </ds-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { updateUserMutation } from '~/graphql/User.js'

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
          mutation: updateUserMutation(),
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

<style lang="scss">
.embed-component {
  position: relative;
  padding: 0;
  margin: $space-small auto;
  overflow: hidden;
  border-radius: $border-radius-base;
  border: 1px solid $color-neutral-70;
  background-color: $color-neutral-90;

  > .content {
    width: 100%;
    height: 100%;

    h4 {
      margin: $space-small 0 0 $space-small;
    }

    p,
    a {
      display: block;
      margin: 0 0 0 $space-small;
    }

    .html {
      width: 100%;

      iframe {
        width: 100%;
      }
    }

    .preview {
      width: 100%;
      height: auto;
      max-height: 450px;
    }

    .preview.--clickable {
      cursor: pointer;
    }
  }

  > .overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    padding: $space-large;
    background-color: $color-neutral-100;

    > .buttons {
      .base-button {
        margin-right: $space-small;
        white-space: nowrap;
      }
    }

    > .checkbox {
      display: flex;

      input {
        margin-right: $space-small;
      }
    }
  }

  > .close-button {
    position: absolute;
    top: $space-x-small;
    right: $space-x-small;
  }
}

.ProseMirror[contenteditable='false'] {
  .close-button {
    display: none;
  }
}
</style>
