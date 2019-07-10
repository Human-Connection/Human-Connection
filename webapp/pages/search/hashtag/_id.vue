<template>
  <div></div>
</template>

<script>
export default {
  mounted() {
    const { id: hashtag } = this.$route.params
    this.$router.push({ path: '/', query: { hashtag } })
  },
}
</script>
