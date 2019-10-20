<template>
  <ds-tag>#{{ id }}</ds-tag>
</template>

<script>
export default {
  name: 'HcHashtag',
  props: {
    id: { type: String, required: true },
  },
}
</script>
