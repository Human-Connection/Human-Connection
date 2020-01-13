<template>
  <div :class="[`--${this.size}`, 'user-avatar', { 'no-image': !hasImage || error }]">
    <img v-if="hasImage && !error" :src="user.avatar | proxyApiUrl" @error="onError" />
    <base-icon name="eye-slash" v-else-if="isAnonymous" />
    <span v-else>{{ userInitials }}</span>
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    size: {
      type: String,
      default: 'base',
      validator: value => {
        return value.match(/(small|base|large)/)
      },
    },
    user: { type: Object, default: null },
  },
  data() {
    return {
      error: false,
    }
  },
  computed: {
    isAnonymous() {
      return !this.user || !this.user.name || this.user.name.toLowerCase() === 'anonymous'
    },
    hasImage() {
      return Boolean(this.user && this.user.avatar)
    },
    userInitials() {
      const { name } = this.user || 'Anonymous'
      const namesArray = name.split(/[ -]/)
      let initials = ''
      for (var i = 0; i < namesArray.length; i++) initials += namesArray[i].charAt(0)
      if (initials.length > 3 && /[A-Z]/.test(initials)) initials = initials.replace(/[a-z]+/g, '')
      return initials.substr(0, 3).toUpperCase()
    },
  },
  methods: {
    onError() {
      this.error = true
    },
  },
}
</script>
<style lang="scss">
.user-avatar {
  img {
    width: 100%;
    border-radius: 50%;
    overflow: hidden;
    object-fit: cover;
    object-position: center;
  }

  .base-icon {
    margin-top: -0.1em;
  }

  &.--small {
    width: $size-avatar-small;
    height: $size-avatar-small;
  }
  &.--base {
    border-width: 1px;
    width: $size-avatar-base;
    height: $size-avatar-base;
  }
  &.--large {
    width: $size-avatar-large;
    height: $size-avatar-large;
    font-size: $font-size-xx-large;
  }
  &.no-image {
    display: flex;
    flex-wrap: wrap;
    border-radius: 50%;
    align-items: center;
    justify-content: center;
    background-color: $background-color-secondary;
    color: $text-color-primary-inverse;
  }
}
</style>
