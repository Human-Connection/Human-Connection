<template>
  <ds-button
    :disabled="disabled || !followId"
    :loading="loading"
    :icon="icon"
    :primary="isFollowed && !hovered"
    :danger="isFollowed && hovered"
    fullwidth
    @mouseenter.native="hovered = !disabled"
    @mouseleave.native="hovered = false"
    @click.prevent="toggle"
  >
    {{ label }}
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
      loading: false,
      hovered: false
    }
  },
  computed: {
    icon() {
      if (this.isFollowed && this.hovered) {
        return 'close'
      } else {
        return this.isFollowed ? 'check' : 'plus'
      }
    },
    label() {
      if (this.isFollowed && this.hovered) {
        return this.$t('followButton.unfollow')
      } else if (this.isFollowed) {
        return this.$t('followButton.following')
      } else {
        return this.$t('followButton.follow')
      }
    }
  },
  watch: {
    isFollowed() {
      this.loading = false
    }
  },
  methods: {
    toggle() {
      const follow = !this.isFollowed
      const mutation = follow ? 'follow' : 'unfollow'

      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!) {
              ${mutation}(id: $id, type: User)
            }
          `,
          variables: {
            id: this.followId
          }
        })
        .then(res => {
          this.$emit('update', !this.isFollowed)
        })
        .catch(() => {
          this.loading = false
        })
    }
  }
}
</script>
