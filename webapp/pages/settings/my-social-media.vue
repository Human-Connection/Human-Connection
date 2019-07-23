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
          <ds-list-item v-for="link in socialMediaLinks" :key="link.id" class="list-item--high">
            <ds-input
              v-if="editingLink.id === link.id"
              id="editSocialMedia"
              model="socialMediaUrl"
              type="text"
              :placeholder="$t('settings.social-media.placeholder')"
            />

            <template v-else>
              <a :href="link.url" target="_blank">
                <img :src="link.favicon" alt="Link:" height="16" width="16" />
                {{ link.url }}
              </a>
              <span class="divider">|</span>
              <a name="edit" @click="handleEditSocialMedia(link)">
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
          id="addSocialMedia"
          model="socialMediaUrl"
          type="text"
          :placeholder="$t('settings.social-media.placeholder')"
        />
        <ds-space margin-top="base">
          <ds-button primary :disabled="disabled">
            {{ editingLink.id ? $t('actions.save') : $t('settings.social-media.submit') }}
          </ds-button>
          <ds-button v-if="editingLink.id" id="cancel" ghost @click="handleCancel()">
            {{ $t('actions.cancel') }}
          </ds-button>
        </ds-space>
      </ds-space>
    </ds-card>
  </ds-form>
</template>

<script>
import unionBy from 'lodash/unionBy'
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      formData: {
        socialMediaUrl: '',
      },
      formSchema: {
        socialMediaUrl: {
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
      const domainRegex = /^(?:https?:\/\/)?(?:[^@\n])?(?:www\.)?([^:/\n?]+)/g
      const { socialMedia = [] } = this.currentUser
      return socialMedia.map(({ id, url }) => {
        const [domain] = url.match(domainRegex) || []
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
      this.formData.socialMediaUrl = ''
      this.disabled = true
    },
    handleEditSocialMedia(link) {
      this.editingLink = link
      this.formData.socialMediaUrl = link.url
      this.disabled = false
    },
    handleInput(data) {
      this.disabled = true
    },
    handleInputValid(data) {
      if (data.socialMediaUrl.length < 1) {
        this.disabled = true
      } else {
        this.disabled = false
      }
    },
    async handleDeleteSocialMedia(link) {
      try {
        await this.$apollo.mutate({
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

        this.$toast.success(this.$t('settings.social-media.successDelete'))
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    async handleSubmitSocialMedia() {
      const isEditing = !!this.editingLink.id
      const url = this.formData.socialMediaUrl

      const duplicateUrl = this.socialMediaLinks.find(link => link.url === url)
      if (duplicateUrl && duplicateUrl.id !== this.editingLink.id) {
        return this.$toast.error(this.$t('settings.social-media.requireUnique'))
      }

      let mutation = gql`
        mutation($url: String!) {
          CreateSocialMedia(url: $url) {
            id
            url
          }
        }
      `
      const variables = { url }
      let successMessage = this.$t('settings.social-media.successAdd')

      if (isEditing) {
        mutation = gql`
          mutation($id: ID!, $url: String!) {
            UpdateSocialMedia(id: $id, url: $url) {
              id
              url
            }
          }
        `
        variables.id = this.editingLink.id
        successMessage = this.$t('settings.data.success')
      }

      try {
        await this.$apollo.mutate({
          mutation,
          variables,
          update: (store, { data }) => {
            const newSocialMedia = isEditing ? data.UpdateSocialMedia : data.CreateSocialMedia
            this.setCurrentUser({
              ...this.currentUser,
              socialMedia: unionBy([newSocialMedia], this.currentUser.socialMedia, 'id'),
            })
          },
        })

        this.$toast.success(successMessage)
        this.formData.socialMediaUrl = ''
        this.disabled = true
        this.editingLink = {}
      } catch (err) {
        this.$toast.error(err.message)
      }
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

.list-item--high {
  .ds-list-item-prefix {
    align-self: center;
  }
}
</style>
