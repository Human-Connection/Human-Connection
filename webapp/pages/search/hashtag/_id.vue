<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    let { id: hashtag } = this.$route.params
    // 'hashtag' seems automatically 'decodeURI' on macOS Firefox. Don't know if this is always the case.
    this.$router.push({ path: '/', query: { hashtag: encodeURI(hashtag) } })
  },
}
</script>
