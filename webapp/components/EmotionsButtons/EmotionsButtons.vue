<template>
  <ds-space margin="large" style="text-align: center">
    <ds-flex :gutter="{ lg: 'large' }" class="emotions-flex">
      <div v-for="emotion in emotionsList" :key="emotion">
        <ds-flex-item :width="{ lg: '100%' }">
          <ds-button
            :loading="loading"
            size="large"
            ghost
            @click="toggleEmotion(emotion)"
            class="emotions-buttons"
          >
            <img :src="iconPath(emotion)" alt width="53" />
          </ds-button>
          <ds-space margin-bottom="xx-small" />
          <div>
            <p class="emotions-label">{{ emotion }}</p>
            <p :key="postsEmotionsCountByEmotion[emotion.toLowerCase()]">
              {{ postsEmotionsCountByEmotion[emotion.toLowerCase()] }}
            </p>
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
      emotionsList: ['Funny', 'Happy', 'Surprised', 'Cry', 'Angry'],
      selectedEmotions: [],
      postsEmotionsCountByEmotion: {},
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  mounted() {
    this.emotionsList.map(emotion => {
      this.emotionsCount(emotion.toLowerCase())
    })
  },
  methods: {
    iconPath(emotion) {
      if (this.isActive(emotion)) {
        return `/img/svg/emoji/${emotion.toLowerCase()}_color.svg`
      }
      return `/img/svg/emoji/${emotion.toLowerCase()}.svg`
    },
    toggleEmotion(emotion) {
      const index = this.selectedEmotions.indexOf(emotion)
      if (index > -1) {
        this.selectedEmotions.splice(index, 1)
      } else {
        this.selectedEmotions.push(emotion)
      }
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
      this.$apollo.mutate({
        mutation: this.isActive(emotion) ? addPostEmotionsMutation : removePostEmotionsMutation,
        variables: {
          from: { id: this.currentUser.id },
          to: { id: this.post.id },
          data: { emotion: emotion.toLowerCase() },
        },
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
            query($id: ID!, $data: _EMOTEDInput!) {
              postsEmotionsCountByEmotion(id: $id, data: $data)
            }
          `,
          variables: { id: this.post.id, data: { emotion } },
        })
        .then(({ data: { postsEmotionsCountByEmotion } }) => {
          this.postsEmotionsCountByEmotion[emotion] = postsEmotionsCountByEmotion
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
