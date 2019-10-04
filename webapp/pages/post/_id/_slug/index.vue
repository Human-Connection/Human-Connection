<template>
  <transition name="fade" appear>
    <ds-card
      v-if="post && ready"
      :image="post.image | proxyApiUrl"
      :class="{ 'post-card': true, 'disabled-content': post.disabled }"
    >
      <ds-space margin-bottom="small" />
      <hc-user :user="post.author" :date-time="post.createdAt">
        <template v-slot:dateTime>
          <ds-text v-if="post.createdAt !== post.updatedAt">({{ $t('post.edited') }})</ds-text>
        </template>
      </hc-user>
      <client-only>
        <content-menu
          placement="bottom-end"
          resource-type="contribution"
          :resource="post"
          :modalsData="menuModalsData"
          :is-owner="isAuthor(post.author ? post.author.id : null)"
        />
      </client-only>
      <ds-space margin-bottom="small" />
      <ds-heading tag="h3" no-margin class="hyphenate-text">{{ post.title }}</ds-heading>
      <ds-space margin-bottom="small" />
      <content-viewer class="content hyphenate-text" :content="post.content" />
      <!-- eslint-enable vue/no-v-html -->
      <ds-space margin="xx-large" />
      <!-- Categories -->
      <div class="categories">
        <ds-space margin="xx-small" />
        <hc-category
          v-for="category in post.categories"
          :key="category.id"
          :icon="category.icon"
          :name="$t(`contribution.category.name.${category.slug}`)"
        />
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div v-if="post.tags && post.tags.length" class="tags">
        <ds-space margin="xx-small" />
        <hc-hashtag v-for="tag in post.tags" :key="tag.id" :id="tag.id" />
      </div>
      <ds-space margin-top="x-large">
        <ds-flex :gutter="{ lg: 'small' }">
          <ds-flex-item
            :width="{ lg: '75%', md: '75%', sm: '75%' }"
            class="emotions-buttons-mobile"
          >
            <hc-emotions :post="post" />
          </ds-flex-item>
          <ds-flex-item :width="{ lg: '10%', md: '3%', sm: '3%' }" />
          <!-- Shout Button -->
          <ds-flex-item
            :width="{ lg: '15%', md: '22%', sm: '22%', base: '100%' }"
            class="shout-button"
          >
            <hc-shout-button
              v-if="post.author"
              :disabled="isAuthor(post.author.id)"
              :count="post.shoutedCount"
              :is-shouted="post.shoutedByCurrentUser"
              :post-id="post.id"
            />
          </ds-flex-item>
        </ds-flex>
      </ds-space>
      <!-- Comments -->
      <ds-section slot="footer">
        <hc-comment-list :post="post" />
        <ds-space margin-bottom="large" />
        <hc-comment-form :post="post" @createComment="createComment" />
      </ds-section>
    </ds-card>
  </transition>
</template>

<script>
import ContentViewer from '~/components/Editor/ContentViewer'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import ContentMenu from '~/components/ContentMenu'
import HcUser from '~/components/User/User'
import HcShoutButton from '~/components/ShoutButton.vue'
import HcCommentForm from '~/components/CommentForm/CommentForm'
import HcCommentList from '~/components/CommentList/CommentList'
import { postMenuModalsData, deletePostMutation } from '~/components/utils/PostHelpers'
import PostQuery from '~/graphql/PostQuery'
import HcEmotions from '~/components/Emotions/Emotions'

export default {
  name: 'PostSlug',
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    HcCategory,
    HcHashtag,
    HcUser,
    HcShoutButton,
    ContentMenu,
    HcCommentForm,
    HcCommentList,
    HcEmotions,
    ContentViewer,
  },
  head() {
    return {
      title: this.title,
    }
  },
  data() {
    return {
      post: null,
      ready: false,
      title: 'loading',
    }
  },
  watch: {
    Post(post) {
      this.post = post[0] || {}
      this.title = this.post.title
    },
  },
  mounted() {
    setTimeout(() => {
      // NOTE: quick fix for jumping flexbox implementation
      // will be fixed in a future update of the styleguide
      this.ready = true
    }, 50)
  },
  computed: {
    menuModalsData() {
      return postMenuModalsData(
        // "this.post" may not always be defined at the beginning …
        this.post ? this.$filters.truncate(this.post.title, 30) : '',
        this.deletePostCallback,
      )
    },
  },
  methods: {
    isAuthor(id) {
      return this.$store.getters['auth/user'].id === id
    },
    async deletePostCallback() {
      try {
        await this.$apollo.mutate(deletePostMutation(this.post.id))
        this.$toast.success(this.$t('delete.contribution.success'))
        this.$router.history.push('/') // Redirect to index (main) page
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    async createComment(comment) {
      this.post.comments.push(comment)
    },
  },
  apollo: {
    Post: {
      query() {
        return PostQuery(this.$i18n)
      },
      variables() {
        return {
          id: this.$route.params.id,
        }
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.page-name-post-id-slug {
  .content-menu {
    float: right;
    margin-right: -$space-x-small;
    margin-top: -$space-large;
  }

  .post-card {
    margin: auto;
    cursor: auto;

    .comments {
      margin-top: $space-small;

      .comment {
        margin-top: $space-small;
        position: relative;
      }

      .ProseMirror {
        min-height: 0px;
      }
    }

    .ds-card-image {
      img {
        max-height: 710px;
        object-fit: cover;
        object-position: center;
      }
    }

    .ds-card-footer {
      padding: 0;

      .ds-section {
        padding: $space-base;
      }
    }
  }
}
@media only screen and (max-width: 960px) {
  .shout-button {
    float: left;
  }
}
</style>
