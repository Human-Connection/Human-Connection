<template>
  <div class="emotions-button-group">
    <emotion-button
      v-for="emotion in Object.keys(PostsEmotionsCountByEmotion)"
      :key="emotion"
      :emojiPath="iconPath(emotion)"
      :emotion="emotion"
      :emotionCount="PostsEmotionsCountByEmotion[emotion]"
      @toggleEmotion="toggleEmotion"
    />
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import EmotionButton from '~/components/EmotionButton/EmotionButton'
import { PostsEmotionsByCurrentUser } from '~/graphql/PostQuery.js'
import PostMutations from '~/graphql/PostMutations.js'

export default {
  components: {
    EmotionButton,
  },
  props: {
    post: { type: Object, default: () => {} },
  },
  data() {
    return {
      selectedEmotions: [],
      PostsEmotionsCountByEmotion: { funny: 0, happy: 0, surprised: 0, cry: 0, angry: 0 },
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  created() {
    Object.keys(this.PostsEmotionsCountByEmotion).map((emotion) => {
      this.emotionsCount(emotion)
    })
  },
  methods: {
    iconPath(emotion) {
      if (this.isActive(emotion)) {
        return `/img/svg/emoji/${emotion}_color.svg`
      }
      return `/img/svg/emoji/${emotion}.svg`
    },
    toggleEmotion(emotion) {
      this.$apollo
        .mutate({
          mutation: this.isActive(emotion)
            ? PostMutations().RemovePostEmotionsMutation
            : PostMutations().AddPostEmotionsMutation,
          variables: {
            to: { id: this.post.id },
            data: { emotion },
          },
        })
        .then(() => {
          this.isActive(emotion)
            ? this.PostsEmotionsCountByEmotion[emotion]--
            : this.PostsEmotionsCountByEmotion[emotion]++

          const index = this.selectedEmotions.indexOf(emotion)
          if (index > -1) {
            this.selectedEmotions.splice(index, 1)
          } else {
            this.selectedEmotions.push(emotion)
          }
        })
    },
    isActive(emotion) {
      const index = this.selectedEmotions.indexOf(emotion)
      if (index > -1) {
        return true
      }
      return false
    },
    emotionsCount(emotion) {
      this.$apollo
        .query({
          query: gql`
            query($postId: ID!, $data: _EMOTEDInput!) {
              PostsEmotionsCountByEmotion(postId: $postId, data: $data)
            }
          `,
          variables: { postId: this.post.id, data: { emotion } },
          fetchPolicy: 'no-cache',
        })
        .then(({ data: { PostsEmotionsCountByEmotion } }) => {
          this.PostsEmotionsCountByEmotion[emotion] = PostsEmotionsCountByEmotion
        })
    },
  },
  apollo: {
    PostsEmotionsByCurrentUser: {
      query() {
        return PostsEmotionsByCurrentUser()
      },
      variables() {
        return {
          postId: this.post.id,
        }
      },
      update({ PostsEmotionsByCurrentUser }) {
        this.selectedEmotions = PostsEmotionsByCurrentUser
      },
    },
  },
}
</script>

<style lang="scss">
.emotions-button-group {
  display: flex;
}
</style>
