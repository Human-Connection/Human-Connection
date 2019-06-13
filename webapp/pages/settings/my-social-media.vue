<template>
  <ds-card :header="$t('settings.social-media.name')">
    <ds-space v-if="socialMediaLinks" margin-top="base" margin="x-small">
      <ds-list>
        <ds-list-item v-for="link in socialMediaLinks" :key="link.id">
          <a :href="link.url" target="_blank">
            <img :src="link.favicon | proxyApiUrl" alt="Social Media link" width="16" height="16" />
            {{ link.url }}
          </a>
          &nbsp;&nbsp;
          <span class="layout-leave-active">|</span>
          &nbsp;&nbsp;
          <ds-icon name="edit" class="layout-leave-active" />
          <a name="delete" @click="handleDeleteSocialMedia(link)">
            <ds-icon name="trash" />
          </a>
        </ds-list-item>
      </ds-list>
    </ds-space>
    <ds-space margin-top="base">
      <div>
        <ds-input
          v-model="value"
          :placeholder="$t('settings.social-media.placeholder')"
          name="social-media"
          :schema="{ type: 'url' }"
        />
      </div>
      <ds-space margin-top="base">
        <div>
          <ds-button primary @click="handleAddSocialMedia">
            {{ $t('settings.social-media.submit') }}
          </ds-button>
        </div>
      </ds-space>
    </ds-space>
  </ds-card>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'

export default {
  data() {
    return {
      value: '',
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
    handleAddSocialMedia() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($url: String!) {
              CreateSocialMedia(url: $url) {
                id
                url
              }
            }
          `,
          variables: {
            url: this.value,
          },
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
          this.value = ''
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
.layout-leave-active {
  opacity: 0.4;
}
</style>
