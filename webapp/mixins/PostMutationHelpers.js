import gql from 'graphql-tag'

export default {
  data() {
    return {
      menuModalsData: {
        delete: {
          titleIdent: 'delete.contribution.title',
          messageIdent: 'delete.contribution.message',
          messageParams: {
            // "this.post" is not defined at the beginning …
            name: this.post ? this.$filters.truncate(this.post.title, 30) : '',
          },
          buttons: {
            confirm: {
              icon: 'trash',
              textIdent: 'delete.submit',
              callback: this.deletePostCallback,
            },
            cancel: {
              icon: 'close',
              textIdent: 'delete.cancel',
              callback: () => {},
            },
          },
        },
      },
    }
  },
  methods: {
    async deletePostCallback(postDisplayType = 'list') {
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
          variables: {
            id: this.post.id,
          },
        })
        this.$toast.success(this.$t('delete.contribution.success'))
        switch (postDisplayType) {
          case 'list':
            this.$emit('deletePost')
            break
          default:
            // case 'page':
            this.$router.history.push('/') // Single page type: Redirect to index (main) page
            break
        }
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
