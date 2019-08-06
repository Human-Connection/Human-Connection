<template>
  <ds-flex :gutter="{ lg: 'large' }" class="emotions-flex">
    <div v-for="emotion in Object.keys(postsEmotionsCountByEmotion)" :key="emotion">
      <ds-flex-item :width="{ lg: '100%' }">
        <ds-button size="large" ghost @click="toggleEmotion(emotion)" class="emotions-buttons">
          <img :src="iconPath(emotion)" width="53" />
        </ds-button>
        <ds-space margin-bottom="xx-small" />
        <div class="emotions-mobile-space">
          <p class="emotions-label">{{ $t(`contribution.emotions-label.${emotion}`) }}</p>
          <ds-heading style="display: inline" tag="h3" :key="postsEmotionsCountByEmotion[emotion]">
            {{ postsEmotionsCountByEmotion[emotion] }}x
          </ds-heading>
          {{ $t('contribution.emotions-label.emoted') }}
        </div>
      </ds-flex-item>
    </div>
  </ds-flex>
</template>
<script>
import gql from 'graphql-tag'
import { mapGetters } from 'vuex'
import { postsEmotionsCountByCurrentUser } from '~/graphql/PostQuery.js'
import PostMutations from '~/graphql/PostMutations.js'

export default {
  props: {
    post: { type: Object, default: () => {} },
  },
  data() {
    return {
      selectedEmotions: [],
      postsEmotionsCountByEmotion: { funny: 0, happy: 0, surprised: 0, cry: 0, angry: 0 },
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  created() {
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
      this.$apollo
        .mutate({
          mutation: this.isActive(emotion)
            ? PostMutations().removePostEmotionsMutation
            : PostMutations().addPostEmotionsMutation,
          variables: {
            from: { id: this.currentUser.id },
            to: { id: this.post.id },
            data: { emotion },
          },
        })
        .then(() => {
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
          fetchPolicy: 'no-cache',
        })
        .then(({ data: { postsEmotionsCountByEmotion } }) => {
          this.postsEmotionsCountByEmotion[emotion] = postsEmotionsCountByEmotion
        })
    },
  },
  apollo: {
    postsEmotionsCountByCurrentUser: {
      query() {
        return postsEmotionsCountByCurrentUser()
      },
      variables() {
        return {
          postId: this.post.id,
        }
      },
      result({ data: { postsEmotionsCountByCurrentUser } }) {
        this.selectedEmotions = postsEmotionsCountByCurrentUser
      },
    },
  },
}
</script>
<style lang="scss">
.emotions-flex {
  justify-content: space-evenly;
  text-align: center;
}

.emotions-label {
  font-size: $font-size-small;
}

.emotions-buttons {
  &:hover {
    background-color: $background-color-base;
  }
}
@media only screen and (max-width: 960px) {
  .emotions-mobile-space {
    margin-bottom: 32px;
  }
}
</style>
