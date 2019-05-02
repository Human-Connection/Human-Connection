<template>
  <ds-card :header="$t('settings.social-media.name')">
    <ds-space
      v-if="socialMediaLinks"
      margin-top="base"
      margin="x-small"
    >
      <ds-list>
        <ds-list-item
          v-for="link in socialMediaLinks"
          :key="link.url"
        >
          <a
            :href="link.url"
            target="_blank"
          >
            <img
              :src="link.favicon"
              alt="Social Media link"
              width="16"
              height="16"
            >
            {{ link.url }}
          </a>
          &nbsp;&nbsp; | &nbsp;&nbsp;
          <ds-icon
            name="edit"
            class="layout-leave-active"
          />
          <a
            @click="handleDeleteSocialMedia(link)"
          >
            <ds-icon name="trash"/>
          </a>
        </ds-list-item>
      </ds-list>
    </ds-space>
    <ds-space margin-top="base">
      <div>
        <ds-input
          v-model="value"
          placeholder="Add social media url"
          name="social-media"
          :schema="{type: 'url'}"
        />
      </div>
      <ds-space margin-top="base">
        <div>
          <ds-button
            primary
            @click="handleAddSocialMedia"
          >
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
      value: ''
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    }),
    socialMediaLinks() {
      const { socialMedia = [] } = this.currentUser
      return socialMedia.map(socialMedia => {
        const { url } = socialMedia
        const matches = url.match(
          /^(?:https?:\/\/)?(?:[^@\n])?(?:www\.)?([^:\/\n?]+)/g
        )
        const [domain] = matches || []
        const favicon = domain ? `${domain}/favicon.ico` : null
        return { url, favicon }
      })
    }
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER'
    }),
    handleAddSocialMedia() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($url: String!) {
              CreateSocialMedia(url: $url) {
                url
              }
            }
          `,
          variables: {
            url: this.value
          },
          update: (store, { data }) => {
            const socialMedia = [
              ...this.currentUser.socialMedia,
              data.CreateSocialMedia
            ]
            this.setCurrentUser({
              ...this.currentUser,
              socialMedia
            })
          }
        })
        .then(
          this.$toast.success(this.$t('settings.social-media.success')),
          (this.value = '')
        )
    },
    handleDeleteSocialMedia(link) {
      console.log(link)
    }
  }
}
</script>

<style lang="scss">
.layout-leave-active {
  opacity: 0.4;
}
</style>
