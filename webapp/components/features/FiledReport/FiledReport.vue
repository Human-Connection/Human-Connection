<template>
  <nuxt-link :to="to">
    <strong>{{ label | truncate(50) }}</strong>
  </nuxt-link>
</template>

<script>
export default {
  props: {
    filedReport: { required: true, type: Object },
  },
  computed: {
    to() {
      const name = this.resource.__typename === 'User' ? 'profile-id-slug' : 'post-id-slug'
      const { post } = this.resource
      const { id, slug } = post || this.resource
      const to = { name, params: { id, slug } }
      if (post) to.params.commentId = this.resource.id
      return to
    },
    label() {
      const { name, content, title } = this.resource
      const mapping = {
        User: name,
        Comment: content,
        Post: title,
      }
      return mapping[this.resource.__typename]
    },
    resource() {
      return this.filedReport.resource
    },
  },
}
</script>
