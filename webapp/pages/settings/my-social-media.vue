<template>
  <ds-card :header="$t('settings.social-media.name')">
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
    <ds-space 
      v-if="currentUser.socialMedia && currentUser.socialMedia.length"
      margin-top="base"
      margin="x-small"
    >
      <div
        v-for="socialMediaIconUrl in socialMediaIconUrl"
        :key="socialMediaIconUrl"
      >
        <a>
          <img
            :src="socialMediaIcon.match(/^(?:https?:\/\/)?(?:[^@\n])?(?:www\.)?([^:\/\n?]+)/g)[0] + '/favicon.ico'"
            :href="socialMediaIcon"
            alt=""
          >
        </a>
      </div>
    </ds-space>
  </ds-card>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'

export default {
  props: {
    socialMediaIconUrl: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      value: ''
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user'
    })
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
        .then(
          response => (this.socialMediaIconUrl = response.data.addSocialMedia)
        )
        .finally(() => {
          this.$toast.success(this.$t('settings.social-media.success'))
        })
    }
  }
}
</script>
