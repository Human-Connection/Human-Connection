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
import { followUserMutation, unfollowUserMutation } from '~/graphql/User'

export default {
  name: 'HcFollowButton',

  props: {
    followId: { type: String, default: null },
    isFollowed: { type: Boolean, default: false },
  },
  data() {
    return {
      disabled: false,
      loading: false,
      hovered: false,
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
    },
  },
  watch: {
    isFollowed() {
      this.loading = false
      this.hovered = false
    },
  },
  methods: {
    onHover() {
      if (!this.disabled && !this.loading) {
        this.hovered = true
      }
    },
    async toggle() {
      const follow = !this.isFollowed
      const mutation = follow ? followUserMutation(this.$i18n) : unfollowUserMutation(this.$i18n)

      this.hovered = false
      const optimisticResult = { followedByCurrentUser: follow }
      this.$emit('optimistic', optimisticResult)

      try {
        const { data } = await this.$apollo.mutate({
          mutation,
          variables: { id: this.followId },
        })

        const followedUser = follow ? data.followUser : data.unfollowUser
        this.$emit('update', followedUser)
      } catch {
        optimisticResult.followedByCurrentUser = !follow
        this.$emit('optimistic', optimisticResult)
      }
    },
  },
}
</script>
