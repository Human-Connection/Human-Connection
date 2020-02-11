<template>
  <nuxt-link
    class="post-teaser"
    :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
  >
    <base-card
      :lang="post.language"
      :class="{
        'disabled-content': post.disabled,
        '--highlight': isPinned,
        '--blur-image': post.imageBlurred,
      }"
    >
      <div v-if="post.image" class="card-image">
        <img :src="post.image | proxyApiUrl" class="image" />
      </div>
      <client-only>
        <user-teaser :user="post.author" :date-time="post.createdAt" />
      </client-only>
      <h2 class="card-heading hyphenate-text">{{ post.title }}</h2>
      <!-- TODO: replace editor content with tiptap render view -->
      <!-- eslint-disable vue/no-v-html -->
      <div class="content hyphenate-text" v-html="excerpt" />
      <!-- eslint-enable vue/no-v-html -->
      <footer class="footer">
        <div class="categories">
          <hc-category
            v-for="category in post.categories"
            :key="category.id"
            v-tooltip="{
              content: $t(`contribution.category.name.${category.slug}`),
              placement: 'bottom-start',
              delay: { show: 500 },
            }"
            :icon="category.icon"
          />
        </div>
        <counter-icon icon="bullhorn" :count="post.shoutedCount" />
        <counter-icon icon="comments" :count="post.commentsCount" />
        <client-only>
          <content-menu
            resource-type="contribution"
            :resource="post"
            :modalsData="menuModalsData"
            :is-owner="isAuthor"
            @pinPost="pinPost"
            @unpinPost="unpinPost"
          />
        </client-only>
      </footer>
    </base-card>
    <hc-ribbon
      :class="{ '--pinned': isPinned }"
      :text="isPinned ? $t('post.pinned') : $t('post.name')"
    />
  </nuxt-link>
</template>

<script>
import UserTeaser from '~/components/UserTeaser/UserTeaser'
import ContentMenu from '~/components/ContentMenu/ContentMenu'
import HcCategory from '~/components/Category'
import HcRibbon from '~/components/Ribbon'
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'
import { mapGetters } from 'vuex'
import { postMenuModalsData, deletePostMutation } from '~/components/utils/PostHelpers'

export default {
  name: 'PostTeaser',
  components: {
    UserTeaser,
    HcCategory,
    HcRibbon,
    ContentMenu,
    CounterIcon,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    width: {
      type: Object,
      default: () => {},
    },
  },
  mounted() {
    const width = this.$el.offsetWidth
    const height = Math.min(width / this.post.imageAspectRatio, 2000)
    const imageElement = this.$el.querySelector('.ds-card-image')
    if (imageElement) {
      imageElement.style.height = `${height}px`
    }
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
    }),
    excerpt() {
      return this.$filters.removeLinks(this.post.contentExcerpt)
    },
    isAuthor() {
      const { author } = this.post
      if (!author) return false
      return this.user.id === this.post.author.id
    },
    menuModalsData() {
      return postMenuModalsData(
        // "this.post" may not always be defined at the beginning …
        this.post ? this.$filters.truncate(this.post.title, 30) : '',
        this.deletePostCallback,
      )
    },
    isPinned() {
      return this.post && this.post.pinned
    },
  },
  methods: {
    async deletePostCallback() {
      try {
        const {
          data: { DeletePost },
        } = await this.$apollo.mutate(deletePostMutation(this.post.id))
        this.$toast.success(this.$t('delete.contribution.success'))
        this.$emit('removePostFromList', DeletePost)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
    pinPost(post) {
      this.$emit('pinPost', post)
    },
    unpinPost(post) {
      this.$emit('unpinPost', post)
    },
  },
}
</script>
<style lang="scss">
.post-teaser,
.post-teaser:hover,
.post-teaser:active {
  position: relative;
  display: block;
  height: 100%;
  color: $text-color-base;

  > .ribbon {
    position: absolute;
    top: 50%;
    right: -7px;
  }
}

.post-teaser > .base-card {
  display: flex;
  flex-direction: column;
  height: 100%;

  &.--pinned {
    border: 1px solid $color-warning;
  }

  &.--blur-image > .card-image > .image {
    filter: blur(22px);
  }

  > .card-image {
    overflow: hidden;

    > .image {
      width: 100%;
      object-fit: contain;
    }
  }

  > .content {
    flex-grow: 1;
    margin-bottom: $space-small;
  }

  > .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    > .categories {
      flex-grow: 1;
    }

    > .counter-icon {
      display: block;
      margin-right: $space-small;
      opacity: 0.5;
    }

    > .content-menu {
      position: relative;
      z-index: $z-index-post-teaser-link;
    }

    .ds-tag {
      margin: 0;
    }
  }

  .user-teaser {
    margin-bottom: $space-small;
  }
}
</style>
