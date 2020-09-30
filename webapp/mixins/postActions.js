export default {
  methods: {
    deletePost(deletedPost) {
      this.posts = this.posts.filter((post) => {
        return post.id !== deletedPost.id
      })
    },
    pinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().pinPost,
          variables: {
            id: post.id
          },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.pinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.Post.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
    unpinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().unpinPost,
          variables: {
            id: post.id
          },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.unpinnedSuccessfully'))
          this.resetPostList()
          this.$apollo.queries.Post.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
  },
}
