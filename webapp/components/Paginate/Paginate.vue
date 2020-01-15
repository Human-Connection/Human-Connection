<template>
  <div class="paginate">
    <base-button
      @click="$emit('back')"
      :disabled="!hasPrevious"
      icon="arrow-left"
      circle
      data-test="previous-button"
    />
    <base-button
      @click="$emit('next')"
      :disabled="!hasNext"
      icon="arrow-right"
      circle
      data-test="next-button"
    />
  </div>
</template>

<script>
export default {
  props: {
    hasNext: {
      type: Boolean,
      default: false,
    },
    hasPrevious: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.paginate {
  display: flex;
  justify-content: space-around;
  width: $size-width-paginate;
  margin: $space-x-small auto;
}
</style>
