<template>
  <transition name="fade" appear>
    <base-card
      v-if="post && ready"
      :lang="post.language"
      :class="{
        'post-page': true,
        'disabled-content': post.disabled,
        '--blur-image': blurred,
      }"
    >
      <template #heroImage v-if="post.image">
        <responsive-image :image="post.image" class="image" />
        <aside v-show="post.image && post.image.sensitive" class="blur-toggle">
          <responsive-image v-show="blurred" :image="post.image" class="preview" />
          <base-button
            :icon="blurred ? 'eye' : 'eye-slash'"
            filled
            circle
            @click="blurred = !blurred"
          />
        </aside>
      </template>
      <section class="menu">
        <user-teaser :user="post.author" :date-time="post.createdAt">
          <template #dateTime>
            <ds-text v-if="post.createdAt !== post.updatedAt">({{ $t('post.edited') }})</ds-text>
          </template>
        </user-teaser>
        <client-only>
          <content-menu
            placement="bottom-end"
            resource-type="contribution"
            :resource="post"
            :modalsData="menuModalsData"
            :is-owner="isAuthor"
            @pinPost="pinPost"
            @unpinPost="unpinPost"
          />
        </client-only>
      </section>
      <ds-space margin-bottom="small" />
      <h2 class="title hyphenate-text">{{ post.title }}</h2>
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
        <!-- Post language -->
        <ds-tag v-if="post.language" class="category-tag language">
          <base-icon name="globe" />
          {{ post.language.toUpperCase() }}
        </ds-tag>
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div v-if="post.tags && post.tags.length" class="tags">
        <ds-space margin="xx-small" />
        <hc-hashtag v-for="tag in post.tags" :key="tag.id" :id="tag.id" />
      </div>
      <ds-space margin-top="x-large">
        <ds-flex :gutter="{ lg: 'small' }">
          <ds-flex-item :width="{ lg: '75%', md: '75%', sm: '75%', base: '100%' }">
            <hc-emotions :post="post" />
          </ds-flex-item>
          <!-- Shout Button -->
          <ds-flex-item
            :width="{ lg: '15%', md: '22%', sm: '22%', base: '100%' }"
            class="shout-button"
          >
            <hc-shout-button
              v-if="post.author"
              :disabled="isAuthor"
              :count="post.shoutedCount"
              :is-shouted="post.shoutedByCurrentUser"
              :post-id="post.id"
            />
          </ds-flex-item>
        </ds-flex>
      </ds-space>
      <!-- Comments -->
      <ds-section>
        <comment-list :post="post" @toggleNewCommentForm="toggleNewCommentForm" @reply="reply" />
        <ds-space margin-bottom="large" />
        <comment-form
          v-if="showNewCommentForm && !isBlocked"
          ref="commentForm"
          :post="post"
          @createComment="createComment"
        />
        <ds-placeholder v-if="isBlocked">
          {{ $t('settings.blocked-users.explanation.commenting-disabled') }}
          <br />
          {{ $t('settings.blocked-users.explanation.commenting-explanation') }}
          <a href="https://support.human-connection.org/kb/" target="_blank">FAQ</a>
        </ds-placeholder>
      </ds-section>
    </base-card>
  </transition>
</template>

<script>
import ContentViewer from '~/components/Editor/ContentViewer'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import HcShoutButton from '~/components/ShoutButton.vue'
import CommentForm from '~/components/CommentForm/CommentForm'
import CommentList from '~/components/CommentList/CommentList'
import ResponsiveImage from '~/components/_new/generic/ResponsiveImage/ResponsiveImage'
import { postMenuModalsData, deletePostMutation } from '~/components/utils/PostHelpers'
import PostQuery from '~/graphql/PostQuery'
import HcEmotions from '~/components/Emotions/Emotions'
import PostMutations from '~/graphql/PostMutations'

export default {
  name: 'PostSlug',
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    ResponsiveImage,
    HcCategory,
    HcHashtag,
    UserTeaser,
    HcShoutButton,
    ContentMenu,
    CommentForm,
    CommentList,
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
      showNewCommentForm: true,
      blurred: false,
      blocked: null,
      postAuthor: null,
    }
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
    isBlocked() {
      const { author } = this.post
      if (!author) return false
      return author.blocked
    },
    isAuthor() {
      const { author } = this.post
      if (!author) return false
      return this.$store.getters['auth/user'].id === author.id
    },
  },
  methods: {
    reply(message) {
      this.$refs.commentForm && this.$refs.commentForm.reply(message)
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
    pinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().pinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.pinnedSuccessfully'))
        })
        .catch((error) => this.$toast.error(error.message))
    },
    unpinPost(post) {
      this.$apollo
        .mutate({
          mutation: PostMutations().unpinPost,
          variables: { id: post.id },
        })
        .then(() => {
          this.$toast.success(this.$t('post.menu.unpinnedSuccessfully'))
        })
        .catch((error) => this.$toast.error(error.message))
    },
    toggleNewCommentForm(showNewCommentForm) {
      this.showNewCommentForm = showNewCommentForm
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
      update({ Post }) {
        this.post = Post[0] || {}
        this.title = this.post.title
        const { image } = this.post
        this.postAuthor = this.post.author
        this.blurred = image && image.sensitive
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
<style lang="scss">
.post-page {
  > .hero-image {
    position: relative;
  }

  > .menu {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &.--blur-image > .hero-image > .image {
    filter: blur($blur-radius);
  }

  .blur-toggle {
    position: absolute;
    bottom: 0;
    right: 0;

    display: flex;
    align-items: center;

    height: 80px;
    padding: 12px;

    .preview {
      height: 100%;
      margin-right: 12px;
    }
  }

  .comments {
    margin-top: $space-small;

    .ProseMirror {
      min-height: 0px;
    }
  }
}

@media only screen and (max-width: 960px) {
  .shout-button {
    float: left;
  }
}
</style>
