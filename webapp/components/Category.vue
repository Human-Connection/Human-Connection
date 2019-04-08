<template>
  <ds-tag>
    <ds-icon size="large" :name="icon"/>
    {{ name }}
  </ds-tag>
</template>

<script>
export default {
  name: 'hc-category',
  props: {
    icon: { type: String },
    name: { type: String }
  }
}
</script>
