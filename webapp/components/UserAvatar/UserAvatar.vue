<template>
  <div :class="[`size-${this.size}`, 'user-avatar']">
    <ds-flex v-if="!hasImage || error" style="height: 100%">
      <ds-flex-item centered>
        <template v-if="isAnonymus">
          <base-icon name="eye-slash" />
        </template>
        <template v-else>
          {{ userInitials }}
        </template>
      </ds-flex-item>
    </ds-flex>
    <img v-if="image && !error" :src="image | proxyApiUrl" @error="onError" />
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    name: { type: String, default: 'Anonymus' },
    /**
     * The size used for the avatar.
     * @options small|base|large
     */
    size: {
      type: String,
      default: 'base',
      validator: value => {
        return value.match(/(small|base|large|x-large)/)
      },
    },
    image: { type: String, default: null },
  },
  data() {
    return {
      error: false,
    }
  },
  computed: {
    isAnonymus() {
      return !this.name || this.name.toLowerCase() === 'anonymus'
    },
    hasImage() {
      return Boolean(this.image) && !this.error
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
    height: 100%;
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
}
</style>
