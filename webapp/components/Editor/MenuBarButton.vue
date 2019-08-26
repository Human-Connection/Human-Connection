<template>
  <ds-button size="small" :ghost="!isActive" @click.prevent="onClick" :icon="icon">
    <span v-if="label">{{ label }}</span>
  </ds-button>
</template>

<script>
export default {
  props: {
    isActive: Boolean,
    icon: String,
    label: String,
    onClick: Function,
  },
}
</script>
