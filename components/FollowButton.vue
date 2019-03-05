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
            mutation($id: ID!) {
              follow(id: $id, type: User)
            }
          `,
          variables: {
            id: this.followId
          }
        })
        .then(res => {
          if (res && res.data && res.data.follow) {
            this.$emit('update')
            this.$nextTick(() => {
              this.disabled = true
            })
          }
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
