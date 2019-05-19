import gql from 'graphql-tag'

export default {
  methods: {
    async deletePostCallback(listPageType = true) {
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
        if (listPageType) {
          console.log('Emit "deletePost" !!!')
          this.$emit('deletePost')
        } else {
          console.log('Redirect to index !!!')
          this.$router.history.push('/') // Single page type: redirect to index
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
}
