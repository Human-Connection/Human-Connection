<template>
  <div
    class="ds-number"
    :class="[
      size && `ds-number-size-${size}`
    ]"
  >
    <ds-text
      :size="size"
      class="ds-number-count"
      style="margin-bottom: 0">{{ count }}</ds-text>
    <ds-text
      :uppercase="uppercase"
      class="ds-number-label"
      color="soft"
      v-html="label" />
  </div>
</template>

<script>
export default {
  name: 'DsNumber',
  props: {
    size: { type: String, default: 'x-large' },
    count: { type: [Number, String], default: 0 },
    label: { type: String, default: null },
    uppercase: { type: Boolean, default: false }
  }
}
</script>


<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
