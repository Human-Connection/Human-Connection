<template>
  <div class="paginate">
    <base-button @click="back" :disabled="!hasPrevious" icon="arrow-left" circle />
    <base-button @click="next" :disabled="!hasNext" icon="arrow-right" circle />
  </div>
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

<style lang="scss">
.paginate {
  display: flex;
  justify-content: space-around;
  width: 100px;
  margin: $space-x-small auto;
}
</style>
