<template>
  <ds-space
    margin-top="large"
    style="text-align: center"
  >
    <ds-button
      :loading="loading"
      icon="arrow-down"
      ghost
      @click="$emit('click')"
    >
      mehr laden
    </ds-button>
  </ds-space>
</template>

<script>
export default {
  props: {
    loading: { type: Boolean, default: false }
  }
}
</script>
