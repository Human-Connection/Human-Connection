<template>
  <div :class="['user-avatar', size && `--${this.size}`]">
    <span class="initials">{{ userInitials }}</span>
    <base-icon v-if="isAnonymous" name="eye-slash" />
    <img
      v-if="user && user.avatar"
      :src="user.avatar | proxyApiUrl"
      class="image"
      :alt="user.name"
      :title="user.name"
      @error="$event.target.style.display = 'none'"
    />
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    size: {
      type: String,
      required: false,
      validator: (value) => {
        return value.match(/(small|large)/)
      },
    },
    user: {
      type: Object,
      default: null,
    },
  },
  computed: {
    isAnonymous() {
      return !this.user || !this.user.name || this.user.name.toLowerCase() === 'anonymous'
    },
    userInitials() {
      if (this.isAnonymous) return ''

      return this.user.name.match(/\b\w/g).join('').substring(0, 3).toUpperCase()
    },
  },
}
</script>

<style lang="scss">
.user-avatar {
  position: relative;
  height: $size-avatar-base;
  width: $size-avatar-base;
  border-radius: 50%;
  overflow: hidden;
  background-color: $color-primary-dark;
  color: $text-color-primary-inverse;

  &.--small {
    width: $size-avatar-small;
    height: $size-avatar-small;
  }

  &.--large {
    width: $size-avatar-large;
    height: $size-avatar-large;
    font-size: $font-size-xx-large;
  }

  > .initials,
  > .base-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  > .image {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}
</style>
