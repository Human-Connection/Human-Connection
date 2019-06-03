<template>
  <ds-space
margin-top="large" style="text-align: center"
>
    <ds-button
:loading="loading" icon="arrow-down"
ghost @click="$emit('click')"
>
      {{ $t('actions.loadMore') }}
    </ds-button>
  </ds-space>
</template>

<script>
export default {
  props: {
    loading: { type: Boolean, default: false },
  },
}
</script>
