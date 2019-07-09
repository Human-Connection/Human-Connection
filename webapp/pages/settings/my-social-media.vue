<template>
  <ds-card :header="$t('settings.social-media.name')">
    <ds-space v-if="socialMediaLinks" margin-top="base" margin="x-small">
      <ds-list>
        <ds-list-item v-for="link in socialMediaLinks" :key="link.id">
          <a :href="link.url" target="_blank">
            <img :src="link.favicon | proxyApiUrl" alt="Social Media link" width="16" height="16" />
            {{ link.url }}
          </a>
          <span class="layout-leave-active divider">|</span>
          <ds-icon
            :aria-label="$t('actions.edit')"
            class="layout-leave-active icon-button"
            name="edit"
            :title="$t('actions.edit')"
          />
          <a name="delete" @click="handleDeleteSocialMedia(link)">
            <ds-icon
              :aria-label="$t('actions.delete')"
              class="icon-button"
              name="trash"
              :title="$t('actions.delete')"
            />
          </a>
        </ds-list-item>
      </ds-list>
    </ds-space>
    <ds-space margin-top="base">
      <ds-form
        v-model="formData"
        :schema="formSchema"
        @submit="handleAddSocialMedia"
        @input="handleInput"
        @input-valid="handleInputValid"
      >
        <template>
          <ds-input
            id="socialMediaLink"
            name="social-media"
            model="socialMediaLink"
            type="text"
            :placeholder="$t('settings.social-media.placeholder')"
          />
          <ds-space margin-top="base">
            <div>
              <ds-button primary :disabled="disabled">
                {{ $t('settings.social-media.submit') }}
              </ds-button>
            </div>
          </ds-space>
        </template>
      </ds-form>
    </ds-space>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      formData: {
        socialMediaLink: '',
      },
      formSchema: {
        socialMediaLink: {
          type: 'url',
          message: this.$t('common.validations.url'),
        },
      },
      disabled: true,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    socialMediaLinks() {
      const { socialMedia = [] } = this.currentUser
      return socialMedia.map(socialMedia => {
        const { id, url } = socialMedia
        const matches = url.match(/^(?:https?:\/\/)?(?:[^@\n])?(?:www\.)?([^:/\n?]+)/g)
        const [domain] = matches || []
        const favicon = domain ? `${domain}/favicon.ico` : null
        return { id, url, favicon }
      })
    },
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async handleInput(data) {
      this.disabled = true
    },
    async handleInputValid(data) {
      if (data.socialMediaLink.length < 1) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    },
    async handleAddSocialMedia() {
      const mutation = gql`
        mutation($url: String!) {
          CreateSocialMedia(url: $url) {
            id
            url
          }
        }
      `
      const variables = { url: this.formData.socialMediaLink }

      this.$apollo
        .mutate({
          mutation,
          variables,
          update: (store, { data }) => {
            const socialMedia = [...this.currentUser.socialMedia, data.CreateSocialMedia]
            this.setCurrentUser({
              ...this.currentUser,
              socialMedia,
            })
          },
        })
        .then(() => {
          this.$toast.success(this.$t('settings.social-media.successAdd'))
          this.formData.socialMediaLink = ''
          this.disabled = true
        })
        .catch(error => {
          this.$toast.error(error.message)
        })
    },
    handleDeleteSocialMedia(link) {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!) {
              DeleteSocialMedia(id: $id) {
                id
                url
              }
            }
          `,
          variables: {
            id: link.id,
          },
          update: (store, { data }) => {
            const socialMedia = this.currentUser.socialMedia.filter(
              element => element.id !== link.id,
            )
            this.setCurrentUser({
              ...this.currentUser,
              socialMedia,
            })
          },
        })
        .then(() => {
          this.$toast.success(this.$t('settings.social-media.successDelete'))
        })
        .catch(error => {
          this.$toast.error(error.message)
        })
    },
  },
}
</script>

<style lang="scss">
.divider {
  padding: 0 $space-small;
}

.icon-button {
  cursor: pointer;
}

.layout-leave-active {
  opacity: 0.4;
}
</style>
