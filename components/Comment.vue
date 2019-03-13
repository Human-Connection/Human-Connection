<template>
  <div>
  {{ comment.content }}
  </div>
</template>

<script>
export default {
  props: {
    comment: {
      type: Object,
      default() {
        return {}
      }
    }
  }
}
</script>
