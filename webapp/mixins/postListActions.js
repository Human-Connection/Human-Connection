import PostMutations from '~/graphql/PostMutations'

export default {
  methods: {
    removePostFromList(deletedPost, posts) {
      // Wolle this.posts = this.posts.filter((post) => {
      posts = posts.filter((post) => {
        return post.id !== deletedPost.id
      })
      return posts
    },
    pinPost(post, refetchPostList = () => {}) {
      this.$apollo
        .mutate({
          mutation: PostMutations().pinPost,
          variables: {
            id: post.id
          },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.pinnedSuccessfully'))
          // Wolle this.resetPostList()
          refetchPostList()
          // Wolle this.$apollo.queries.Post.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
    unpinPost(post, refetchPostList = () => {}) {
      this.$apollo
        .mutate({
          mutation: PostMutations().unpinPost,
          variables: {
            id: post.id
          },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.unpinnedSuccessfully'))
          // Wolle this.resetPostList()
          refetchPostList()
          // Wolle this.$apollo.queries.Post.refetch()
        })
        .catch((error) => this.$toast.error(error.message))
    },
  },
}
