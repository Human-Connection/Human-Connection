<template>
  <ds-form
    v-model="formData"
    :schema="formSchema"
    @input="handleInput"
    @input-valid="handleInputValid"
    @submit="handleSubmitSocialMedia"
  >
    <ds-card :header="$t('settings.social-media.name')">
      <ds-space v-if="socialMediaLinks" margin-top="base" margin="x-small">
        <ds-list>
          <ds-list-item v-for="link in socialMediaLinks" :key="link.id">
            <ds-input v-if="editingLink.id === link.id"
              model="socialMediaLink"
              type="text"
              :placeholder="$t('settings.social-media.placeholder')"
            />

            <template v-else>
              <a :href="link.url" target="_blank">
                <img :src="link.favicon | proxyApiUrl" alt="Link:" width="16" height="16" />
                {{ link.url }}
              </a>
              <span class="divider">|</span>
              <a name='edit' @click="handleEditSocialMedia(link)">
                <ds-icon
                  :aria-label="$t('actions.edit')"
                  class="icon-button"
                  name="edit"
                  :title="$t('actions.edit')"
                />
              </a>
              <a name="delete" @click="handleDeleteSocialMedia(link)">
                <ds-icon
                  :aria-label="$t('actions.delete')"
                  class="icon-button"
                  name="trash"
                  :title="$t('actions.delete')"
                />
              </a>
            </template>
          </ds-list-item>
        </ds-list>
      </ds-space>

      <ds-space margin-top="base">
        <ds-input
          v-if="!editingLink.id"
          model="socialMediaLink"
          type="text"
          :placeholder="$t('settings.social-media.placeholder')"
        />
        <ds-space margin-top="base">
          <ds-button primary :disabled="disabled">
            {{ editingLink.id ? $t('actions.save') : $t('settings.social-media.submit') }}
          </ds-button>
          <ds-button v-if="editingLink.id" ghost @click="handleCancel()">
            {{ $t('actions.cancel') }}
          </ds-button>
        </ds-space>
      </ds-space>
    </ds-card>
  </ds-form>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
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
      editingLink: {},
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
    handleCancel() {
      this.editingLink = {}
      this.formData.socialMediaLink = ''
      this.disabled = true
    },
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
    async handleSubmitSocialMedia() {
      if (!this.editingLink.id) {
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
      } else {
        const mutation = gql`
          mutation($id: ID!, $url: String!) {
            UpdateSocialMedia(id: $id, url: $url) {
              id
              url
            }
          }
        `
        const variables = { id: this.editingLink.id, url: this.formData.socialMediaLink }

        this.$apollo
          .mutate({
            mutation,
            variables,
            update: (store, { data }) => {
              const newLink = data.UpdateSocialMedia
              const socialMedia = cloneDeep(this.currentUser.socialMedia)
              const index = socialMedia.findIndex(link => link.id === newLink.id)
              socialMedia.splice(index, 1, newLink)

              this.setCurrentUser({
                ...this.currentUser,
                socialMedia,
              })
            },
          })
          .then(() => {
            this.$toast.success('updated!')
            this.formData.socialMediaLink = ''
            this.editingLink = {}
            this.disabled = true
          })
          .catch(error => {
            this.$toast.error(error.message)
          })
      }

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
    handleEditSocialMedia(link) {
      this.editingLink = link
      this.formData.socialMediaLink = link.url
      this.disabled = false
    },
  },
}
</script>

<style lang="scss">
.divider {
  opacity: 0.4;
  padding: 0 $space-small;
}

.icon-button {
  cursor: pointer;
}

</style>
