<template>
  <ds-space margin="large" style="text-align: center">
    <ds-flex :gutter="{ lg: 'large' }" class="emotions-flex">
      <div v-for="emotion in Object.keys(postsEmotionsCountByEmotion)" :key="emotion">
        <ds-flex-item :width="{ lg: '100%' }">
          <ds-button
            :loading="loading"
            size="large"
            ghost
            @click="toggleEmotion(emotion)"
            class="emotions-buttons"
          >
            <img :src="iconPath(emotion)" width="53" />
          </ds-button>
          <ds-space margin-bottom="xx-small" />
          <div>
            <p class="emotions-label">{{ $t(`contribution.emotions-label.${emotion}`) }}</p>
            <ds-heading
              style="display: inline"
              tag="h3"
              :key="postsEmotionsCountByEmotion[emotion]"
            >
              {{ postsEmotionsCountByEmotion[emotion] }}x
            </ds-heading>
            {{ $t('contribution.emotions-label.emoted') }}
          </div>
        </ds-flex-item>
      </div>
    </ds-flex>
  </ds-space>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'

export default {
  props: {
    post: { type: Object, default: () => {} },
  },
  data() {
    return {
      loading: false,
      selectedEmotions: [],
      postsEmotionsCountByEmotion: { funny: 0, happy: 0, surprised: 0, cry: 0, angry: 0 },
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  mounted() {
    this.myEmotions()
    Object.keys(this.postsEmotionsCountByEmotion).map(emotion => {
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
      const addPostEmotionsMutation = gql`
        mutation($from: _UserInput!, $to: _PostInput!, $data: _EMOTEDInput!) {
          AddPostEmotions(from: $from, to: $to, data: $data) {
            emotion
          }
        }
      `
      const removePostEmotionsMutation = gql`
        mutation($from: _UserInput!, $to: _PostInput!, $data: _EMOTEDInput!) {
          RemovePostEmotions(from: $from, to: $to, data: $data)
        }
      `
      this.$apollo
        .mutate({
          mutation: this.isActive(emotion) ? removePostEmotionsMutation : addPostEmotionsMutation,
          variables: {
            from: { id: this.currentUser.id },
            to: { id: this.post.id },
            data: { emotion },
          },
        })
        .then(response => {
          this.isActive(emotion)
            ? this.postsEmotionsCountByEmotion[emotion]--
            : this.postsEmotionsCountByEmotion[emotion]++
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
              postsEmotionsCountByEmotion(postId: $postId, data: $data)
            }
          `,
          variables: { postId: this.post.id, data: { emotion } },
        })
        .then(({ data: { postsEmotionsCountByEmotion } }) => {
          this.postsEmotionsCountByEmotion[emotion] = postsEmotionsCountByEmotion
        })
    },
    myEmotions() {
      this.$apollo
        .query({
          query: gql`
            query($postId: ID!) {
              postsEmotionsCountByCurrentUser(postId: $postId)
            }
          `,
          variables: { postId: this.post.id },
        })
        .then(({ data: { postsEmotionsCountByCurrentUser } }) => {
          this.selectedEmotions = postsEmotionsCountByCurrentUser
        })
    },
  },
}
</script>
<style lang="scss">
.emotions-flex {
  justify-content: space-evenly;
}

.emotions-label {
  font-size: $font-size-small;
}

.emotions-buttons {
  &:hover {
    background-color: $background-color-base;
  }
}
</style>
