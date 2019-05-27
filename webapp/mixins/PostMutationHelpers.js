import gql from 'graphql-tag'

export default {
  methods: {
    async deletePostCallback(postDisplayType = 'list') {
      console.log('inside "deletePostCallback" !!! ', this.post)
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
          variables: { id: this.post.id },
        })
        this.$toast.success(this.$t(`delete.contribution.success`))
        switch (postDisplayType) {
          case 'list':
            this.$emit('deletePost')
            console.log('emitted "deletePost" !!!')
            break
          default:
            // case 'page'
            this.$router.history.push('/') // Single page type: Redirect to index
            break
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
