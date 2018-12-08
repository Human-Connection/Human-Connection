<template>
  <ds-space
    margin="large"
    style="text-align: center"
  >
    <ds-button
      :disabled="disabled || loading"
      danger
      size="x-large"
      icon="bullhorn"
      @click="shout" />
    <ds-space margin-bottom="xx-small" />
    <ds-text color="soft">
      <ds-heading
        style="display: inline"
        tag="h3"
      >
        {{ shoutedCount }}x
      </ds-heading> Empfohlen
    </ds-text>
  </ds-space>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    count: { type: Number, default: 0 },
    postId: { type: String, default: null }
  },
  data() {
    return {
      loading: false,
      disabled: false,
      shoutedCount: this.count
    }
  },
  methods: {
    shout() {
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($myId: ID!, $postId: ID!) {
              AddUserShouted(from: { id: $myId }, to: { id: $postId }) {
                from {
                  id
                }
              }
            }
          `,
          variables: {
            myId: this.$store.getters['auth/user'].id,
            postId: this.postId
          }
        })
        .then(() => {
          this.loading = false
          this.disabled = true
          this.shoutedCount++
          this.$emit('update')
        })
    }
  }
}
</script>
