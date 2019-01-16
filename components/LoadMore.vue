<template>
  <ds-space
    margin-top="large"
    style="text-align: center"
  >
    <ds-button
      :icon="loading ? 'spinner' : 'arrow-down'"
      :disabled="loading"
      ghost
      @click="$emit('click')"
    >
      {{ $t('actions.loadMore') }}
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
