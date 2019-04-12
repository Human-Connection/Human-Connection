<template>
  <ds-tag>
    <ds-icon
      size="large"
      :name="icon"
    />
    {{ name }}
  </ds-tag>
</template>

<script>
export default {
  name: 'HcCategory',
  props: {
    icon: { type: String, required: true },
    name: { type: String, required: true }
  }
}
</script>
