<template>
  <ds-space
    class="hc-empty"
    centered
    :margin="margin"
  >
    <ds-text>
      <hc-image
        :imageProps="imageProps"
        width="80"
        class="hc-empty-icon"
        style="margin-bottom: 5px"
        alt="Empty"
      /><br>
      <ds-text
        v-show="message"
        class="hc-empty-message"
        color="softer"
      >
        {{ message }}
      </ds-text>
    </ds-text>
  </ds-space>
</template>

<script>
import HcImage from '~/components/Image'
export default {
  components: {
    HcImage
  },
  name: 'HcEmpty',
  props: {
    /**
     * Icon that should be shown
     * @options messages|events|alert|tasks|docs|file
     */
    icon: {
      type: String,
      required: true,
      validator: value => {
        return value.match(/(messages|events|alert|tasks|docs|file)/)
      }
    },
    /**
     * Message that appears under the icon
     */
    message: {
      type: String,
      default: null
    },
    /**
     * Vertical spacing
     */
    margin: {
      type: [String, Object],
      default: 'x-large'
    }
  },
  computed: {
    iconPath() {
      return `/img/empty/${this.icon}.svg`
    },
    imageProps: {
      src: iconPath
    }
  }
}
</script>

<style lang="scss">
.hc-empty-icon {
  padding-bottom: $font-space-large;
}
</style>
