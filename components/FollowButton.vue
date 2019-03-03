<template>
  <ds-button
    :disabled="disabled || !followId || isFollowed"
    :loading="loading"
    icon="plus"
    primary
    fullwidth
    @click.prevent="follow"
  >
    Folgen
  </ds-button>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'HcFollowButton',

  props: {
    followId: { type: String, default: null },
    isFollowed: { type: Boolean, default: false }
  },
  data() {
    return {
      disabled: false,
      loading: false
    }
  },
  methods: {
    follow() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($myId: ID!, $followId: ID!) {
              AddUserFollowing(from: { id: $myId }, to: { id: $followId }) {
                from {
                  id
                }
              }
            }
          `,
          variables: {
            myId: this.$store.getters['auth/user'].id,
            followId: this.followId
          }
        })
        .then(() => {
          this.loading = false
          this.disabled = true
          this.$emit('update')
        })
    }
  }
}
</script>
