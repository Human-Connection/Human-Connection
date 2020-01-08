<template>
  <div :class="[`size-${this.size}`, 'user-avatar']">
    <span v-if="!hasImage || error" class="no-image">
      <span class="flex-item">
        <template v-if="isAnonymous">
          <base-icon name="eye-slash" />
        </template>
        <template v-else>
          {{ userInitials }}
        </template>
      </span>
    </span>
    <img v-if="user && user.avatar && !error" :src="user.avatar | proxyApiUrl" @error="onError" />
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
        return value.match(/(small|base|large|x-large)/)
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
      return Boolean(this.user && this.user.avatar) && !this.error
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

  &.size-small {
    width: $size-avatar-small;
    height: $size-avatar-small;
  }
  &.size-base {
    border-width: 1px;
    width: $size-avatar-base;
    height: $size-avatar-base;
  }
  &.size-large {
    width: $size-avatar-large;
    height: $size-avatar-large;
  }
  &.size-x-large {
    width: $size-avatar-x-large;
    height: $size-avatar-x-large;
  }
  .no-image {
    height: 100%;
    display: flex;
    flex-wrap: wrap;
    border-radius: 50%;
    background-color: $background-color-secondary;
    color: $text-color-primary-inverse;
  }

  .no-image .flex-item {
    box-sizing: border-box;
    padding: 0;
    margin: 0 auto;
    align-self: center;
    display: table;
  }
}
</style>
