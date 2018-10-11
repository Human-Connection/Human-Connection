<template>
  <ds-button
    :disabled="disabled"
    icon="plus"
    primary
    full-width
    @click.prevent="follow">Folgen</ds-button>
</template>

<script>
import gql from 'graphql-tag'

export default {
  name: 'HcFollowButton',

  props: {
    followId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      disabled: false
    }
  },
  methods: {
    follow() {
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
            myId: 'u1',
            followId: this.followId
          }
        })
        .then(() => {
          this.disabled = true
          this.$emit('update')
        })
    }
  }
}
</script>
