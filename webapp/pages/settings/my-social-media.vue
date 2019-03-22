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
      <div>
        <img
          :src="currentUser.socialMedia[0] + '/favicon.ico'"
          alt=""
        >
      </div>
    </ds-space>
  </ds-card>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'

export default {
  props: {
    socialMedia: {
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
        .then(() =>
          this.$toast.success(this.$t('settings.social-media.success'))
        )
    }
  }
}
</script>
