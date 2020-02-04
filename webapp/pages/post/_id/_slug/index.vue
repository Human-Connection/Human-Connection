<template>
  <transition name="fade" appear>
    <ds-card
      :lang="post.language"
      v-if="post && ready"
      :image="post.image && post.image.url | proxyApiUrl"
      :class="{
        'post-page': true,
        'disabled-content': post.disabled,
        '--blur-image': blurred,
      }"
    >
      <aside v-show="post.image && post.image.blurred" class="blur-toggle">
        <img v-show="blurred" :src="post.image && post.image.url | proxyApiUrl" class="preview" />
        <base-button
          :icon="blurred ? 'eye' : 'eye-slash'"
          filled
          circle
          @click="blurred = !blurred"
        />
      </aside>
      <user-teaser :user="post.author" :date-time="post.createdAt">
        <template v-slot:dateTime>
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
      <ds-section slot="footer">
        <comment-list
          :post="post"
          :routeHash="$route.hash"
          @toggleNewCommentForm="toggleNewCommentForm"
          @reply="reply"
        />
        <ds-space margin-bottom="large" />
        <comment-form
          v-if="showNewCommentForm && !isBlocked"
          ref="commentForm"
          :post="post"
          @createComment="createComment"
        />
        <ds-placeholder v-else>
          {{ $t('settings.blocked-users.explanation.commenting-disabled') }}
          <br />
          {{ $t('settings.blocked-users.explanation.commenting-explanation') }}
          <a href="https://support.human-connection.org/kb/" target="_blank">FAQ</a>
        </ds-placeholder>
      </ds-section>
    </ds-card>
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
        .catch(error => this.$toast.error(error.message))
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
        .catch(error => this.$toast.error(error.message))
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
        this.postAuthor = this.post.author
        const { image } = this.post
        if(!image) return
        this.blurred = image.blurred
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>
<style lang="scss">
.post-page {
  &.--blur-image > .ds-card-image img {
    filter: blur(22px);
  }

  .ds-card-content {
    position: relative;
    padding-top: 24px;
  }

  .blur-toggle {
    position: absolute;
    top: -80px;
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

  .content-menu {
    float: right;
    margin-right: -$space-x-small;
    margin-top: -$space-large;
  }

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
      max-height: 2000px;
      object-fit: contain;
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

@media only screen and (max-width: 960px) {
  .shout-button {
    float: left;
  }
}
</style>
