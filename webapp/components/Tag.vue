<template>
  <ds-tag>
    <ds-icon name="tag"/>
    {{ name }}
  </ds-tag>
</template>

<script>
export default {
  name: 'hc-tag',
  props: {
    name: { type: String }
  }
}
</script>
