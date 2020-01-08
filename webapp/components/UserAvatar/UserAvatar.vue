<template>
  <div class="ds-avatar avatar" :class="[`ds-size-${this.size}`, online && 'is-online']">
    <ds-flex v-if="!hasImage || error" style="height: 100%">
      <ds-flex-item centered>
        <template v-if="isAnonymus">
          <ds-icon name="eye-slash" />
        </template>
        <template v-else>
          {{ userInitials }}
        </template>
      </ds-flex-item>
    </ds-flex>
    <img v-if="image && !error" :src="image | proxyApiUrl" @error="onError" :size="size" />
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
    online: { type: Boolean, default: false },
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
