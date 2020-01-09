<template>
  <transition name="fade" appear>
    <ds-card
      :lang="post.language"
      v-if="post && ready"
      :image="post.image | proxyApiUrl"
      :class="{
        'post-page': true,
        'disabled-content': post.disabled,
        '--blur-image': blurred,
      }"
    >
      <aside v-show="post.imageBlurred" class="blur-toggle">
        <img v-show="blurred" :src="post.image | proxyApiUrl" class="preview" />
        <ds-button :icon="blurred ? 'eye' : 'eye-slash'" primary @click="blurred = !blurred" />
      </aside>
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
        <hc-comment-list
          :post="post"
          :routeHash="$route.hash"
          @toggleNewCommentForm="toggleNewCommentForm"
        />
        <ds-space margin-bottom="large" />
        <comment-form
          v-if="showNewCommentForm && !this.blocked"
          :post="post"
          @createComment="createComment"
        />
        <ds-space v-else>
          <ds-placeholder>
            {{ $t('settings.blocked-users.explanation.commenting-disabled') }}
            <br />
            {{ $t('settings.blocked-users.explanation.commenting-explanation') }}
            <a>https://human-connection.org</a>
          </ds-placeholder>
        </ds-space>
      </ds-section>
    </ds-card>
  </transition>
</template>

<script>
import ContentViewer from '~/components/Editor/ContentViewer'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import HcUser from '~/components/User/User'
import HcShoutButton from '~/components/ShoutButton.vue'
import CommentForm from '~/components/CommentForm/CommentForm'
import HcCommentList from '~/components/CommentList/CommentList'
import { postMenuModalsData, deletePostMutation } from '~/components/utils/PostHelpers'
import PostQuery from '~/graphql/PostQuery'
import HcEmotions from '~/components/Emotions/Emotions'
import PostMutations from '~/graphql/PostMutations'
import { blockedByPostAuthor } from '~/graphql/User'

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
    CommentForm,
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
        this.blurred = this.post.imageBlurred
        this.postAuthor = this.post.author
      },
      fetchPolicy: 'cache-and-network',
    },
    blockedByPostAuthor: {
      query() {
        return blockedByPostAuthor()
      },
      variables() {
        return {
          postAuthorId: this.postAuthor ? this.postAuthor.id : this.$store.getters['auth/user'].id,
        }
      },
      update({ blockedByPostAuthor }) {
        this.blocked = blockedByPostAuthor
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
