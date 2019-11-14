<template>
  <span v-if="svgIcon">
    <component :is="svgIcon" />
  </span>
</template>

<script>
import icons from '~/view/assets/icons'

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    svgIcon() {
      const icon = icons[this.name]
      if (!icon) {
        return false
      }
      /*
      a Vue component needs a render function,
      so we check if there is a render function directly on the icon –
      otherwise it is wrapped in icon.default
      */
      return icon.render ? icon : icon.default
    },
  },
}
</script>
