<template>
  <ds-button
    :disabled="disabled || !followId"
    :loading="loading"
    :icon="icon"
    :primary="isFollowed && !hovered"
    :danger="isFollowed && hovered"
    fullwidth
    @mouseenter.native="onHover"
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
      if (this.isFollowed) {
        return this.$t('followButton.following')
      } else {
        return this.$t('followButton.follow')
      }
    }
  },
  watch: {
    isFollowed() {
      this.loading = false
      this.hovered = false
    }
  },
  methods: {
    onHover() {
      if (!this.disabled && !this.loading) {
        this.hovered = true
      }
    },
    toggle() {
      const follow = !this.isFollowed
      const mutation = follow ? 'follow' : 'unfollow'

      this.hovered = false

      this.$emit('optimistic', follow)

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
          if (res && res.data) {
            this.$emit('update', follow)
          } else {
            this.$emit('optimistic', this.isFollowed)
          }
        })
        .catch(() => {
          this.$emit('optimistic', this.isFollowed)
        })
    }
  }
}
</script>
