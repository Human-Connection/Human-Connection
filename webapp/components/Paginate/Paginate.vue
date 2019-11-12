<template>
  <ds-flex direction="row-reverse">
    <ds-flex-item width="50px">
      <ds-button @click="next" :disabled="!hasNext" icon="arrow-right" primary />
    </ds-flex-item>
    <ds-flex-item width="50px">
      <ds-button @click="back" :disabled="!hasPrevious" icon="arrow-left" primary />
    </ds-flex-item>
  </ds-flex>
</template>
<script>
export default {
  props: {
    hasNext: { type: Boolean, default: false },
    hasPrevious: { type: Boolean, default: false },
  },
  methods: {
    back() {
      this.$emit('back')
    },
    next() {
      this.$emit('next')
    },
  },
}
</script>
