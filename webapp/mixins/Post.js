import gql from 'graphql-tag'

export default {
  methods: {
    async confirmCallback() {
      try {
        var gqlMutation = gql`
          mutation($id: ID!) {
            DeletePost(id: $id) {
              id
            }
          }
        `
        await this.$apollo.mutate({
          mutation: gqlMutation,
          variables: { id: this.post.id }
        })
        this.$toast.success(this.$t(`delete.contribution.success`))
        // this.$emit('deletePost')
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
}
