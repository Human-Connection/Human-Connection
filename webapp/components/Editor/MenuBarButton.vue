<template>
  <ds-button size="small" :ghost="!isActive" @click="onClick" :icon="icon">
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
