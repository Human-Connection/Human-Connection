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
          <a :href="link.url">
            <img
              :src="link.favicon"
              alt=""
            >
            {{ link.url }}
          </a>
        </ds-list-item>
      </ds-list>
    </ds-space>
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
  </ds-card>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'

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
      return socialMedia.map(url => {
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
    handleAddSocialMedia() {
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($url: String!) {
              addSocialMedia(url: $url)
            }
          `,
          variables: {
            url: this.value
          }
        })
        .then(this.$toast.success(this.$t('settings.social-media.success')))
    }
  }
}
</script>
