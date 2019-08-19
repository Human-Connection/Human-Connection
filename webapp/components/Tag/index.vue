<template>
  <ds-tag>
    <ds-icon name="tag" />
    {{ id }}
  </ds-tag>
</template>

<script>
export default {
  name: 'HcTag',
  props: {
    id: { type: String, required: true },
  },
}
</script>
