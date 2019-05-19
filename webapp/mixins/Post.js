import gql from 'graphql-tag'

export default {
  methods: {
    async deletePostCallback() {
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
        this.$emit('delete')
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
}
