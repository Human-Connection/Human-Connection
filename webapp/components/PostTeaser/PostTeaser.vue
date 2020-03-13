<template>
  <nuxt-link
    class="post-teaser"
    :to="{ name: 'post-id-slug', params: { id: post.id, slug: post.slug } }"
  >
    <base-card
      :lang="post.language"
      :class="{
        'disabled-content': post.disabled,
        '--blur-image': post.image && post.image.sensitive,
      }"
      :highlight="isPinned"
    >
      <template v-if="post.image" #heroImage>
        <img :src="post.image | proxyApiUrl" class="image" />
      </template>
      <client-only>
        <user-teaser :user="post.author" :date-time="post.createdAt" />
      </client-only>
      <h2 class="title hyphenate-text">{{ post.title }}</h2>
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
        <counter-icon
          icon="bullhorn"
          :count="post.shoutedCount"
          :title="$t('contribution.amount-shouts', { amount: post.shoutedCount })"
        />
        <counter-icon
          icon="comments"
          :count="post.commentsCount"
          :title="$t('contribution.amount-comments', { amount: post.commentsCount })"
        />
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
    const { image } = this.post
    if (!image) return
    const width = this.$el.offsetWidth
    const height = Math.min(width / image.aspectRatio, 2000)
    const imageElement = this.$el.querySelector('.hero-image')
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

  &.--blur-image > .hero-image > .image {
    filter: blur($blur-radius);
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
      opacity: $opacity-disabled;
    }

    > .content-menu {
      position: relative;
      z-index: $z-index-post-teaser-link;
    }

    .ds-tag {
      margin: 0;
      margin-right: $space-xx-small;
    }
  }

  .user-teaser {
    margin-bottom: $space-small;
  }
}
</style>
