<script>
export default {
  layout: 'blank',
  asyncData({ error }) {
    error({ statusCode: 404, message: 'Profile slug missing' })
  }
}
</script>
