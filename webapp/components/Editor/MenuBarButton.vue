<template>
  <base-button size="small" circle :ghost="!isActive" @click="onClick" :icon="icon">
    <span v-if="label">{{ label }}</span>
  </base-button>
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
