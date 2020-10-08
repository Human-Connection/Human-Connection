import PostMutations from '~/graphql/PostMutations'

export default {
  methods: {
    removePostFromList(deletedPost, posts) {
      return posts.filter((post) => {
        return post.id !== deletedPost.id
      })
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
          refetchPostList()
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
          refetchPostList()
        })
        .catch((error) => this.$toast.error(error.message))
    },
  },
}
