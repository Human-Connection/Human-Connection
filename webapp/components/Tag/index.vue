<template>
  <ds-tag>
    <ds-icon name="tag" />
    {{ name }}
  </ds-tag>
</template>

<script>
export default {
  name: 'HcTag',
  props: {
    name: { type: String, required: true },
  },
}
</script>
