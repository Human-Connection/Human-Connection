<template>
  <transition name="fade" appear>
    <ds-card
      v-if="post && ready"
      :image="post.image"
      :class="{ 'post-card': true, 'disabled-content': post.disabled }"
    >
      <ds-space margin-bottom="small" />
      <hc-user :user="post.author" :date-time="post.createdAt" />
      <!-- Content Menu (can open Modals) -->
      <no-ssr>
        <content-menu
          placement="bottom-end"
          resource-type="contribution"
          :resource="post"
          :modalsData="menuModalsData"
          :is-owner="isAuthor(post.author.id)"
        />
      </no-ssr>
      <ds-space margin-bottom="small" />
      <ds-heading tag="h3" no-margin>{{ post.title }}</ds-heading>
      <ds-space margin-bottom="small" />
      <!-- Content -->
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <div class="content hc-editor-content" v-html="post.content" />
      <!-- eslint-enable vue/no-v-html -->
      <ds-space margin="xx-large" />
      <!-- Categories -->
      <div class="categories">
        <ds-space margin="xx-small" />
        <hc-category
          v-for="category in post.categories"
          :key="category.id"
          v-tooltip="{ content: category.name, placement: 'top-start', delay: { show: 300 } }"
          :icon="category.icon"
          :name="category.name"
        />
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div v-if="post.tags && post.tags.length" class="tags">
        <ds-space margin="xx-small" />
        <hc-tag v-for="tag in post.tags" :key="tag.id" :name="tag.name" />
      </div>
      <!-- Shout Button -->
      <hc-shout-button
        v-if="post.author"
        :disabled="isAuthor(post.author.id)"
        :count="post.shoutedCount"
        :is-shouted="post.shoutedByCurrentUser"
        :post-id="post.id"
      />
      <!-- Comments -->
      <ds-section slot="footer">
        <hc-comment-list :post="post" />
        <ds-space margin-bottom="large" />
        <hc-comment-form :post="post" />
      </ds-section>
    </ds-card>
  </transition>
</template>

<script>
import gql from 'graphql-tag'

import HcCategory from '~/components/Category'
import HcTag from '~/components/Tag'
import ContentMenu from '~/components/ContentMenu'
import HcUser from '~/components/User'
import HcShoutButton from '~/components/ShoutButton.vue'
import HcCommentForm from '~/components/comments/CommentForm'
import HcCommentList from '~/components/comments/CommentList'
import { postMenuModalsData, deletePostMutationData } from '~/components/utils/PostHelpers'

export default {
  name: 'PostSlug',
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    HcTag,
    HcCategory,
    HcUser,
    HcShoutButton,
    ContentMenu,
    HcCommentForm,
    HcCommentList,
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
  async asyncData(context) {
    const {
      params,
      error,
      app: { apolloProvider, $i18n },
    } = context
    const client = apolloProvider.defaultClient
    const query = gql(`
      query Post($slug: String!) {
        Post(slug: $slug) {
          id
          title
          content
          createdAt
          disabled
          deleted
          slug
          image
          author {
            id
            slug
            name
            avatar
            disabled
            deleted
            shoutedCount
            contributionsCount
            commentsCount
            followedByCount
            followedByCurrentUser
            location {
              name: name${$i18n.locale().toUpperCase()}
            }
            badges {
              id
              key
              icon
            }
          }
          tags {
            name
          }
          commentsCount
          comments(orderBy: createdAt_desc) {
            id
            contentExcerpt
            createdAt
            disabled
            deleted
            author {
              id
              slug
              name
              avatar
              disabled
              deleted
              shoutedCount
              contributionsCount
              commentsCount
              followedByCount
              followedByCurrentUser
              location {
                name: name${$i18n.locale().toUpperCase()}
              }
              badges {
                id
                key
                icon
              }
            }
          }
          categories {
            id
            name
            icon
          }
          shoutedCount
          shoutedByCurrentUser
        }
      }
    `)
    const variables = { slug: params.slug }
    const {
      data: { Post },
    } = await client.query({ query, variables })
    if (Post.length <= 0) {
      // TODO: custom 404 error page with translations
      const message = 'This post could not be found'
      return error({ statusCode: 404, message })
    }
    const [post] = Post
    return {
      post,
      title: post.title,
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
        await this.$apollo.mutate(deletePostMutationData(this.post.id))
        this.$toast.success(this.$t('delete.contribution.success'))
        this.$router.history.push('/') // Redirect to index (main) page
      } catch (err) {
        this.$toast.error(err.message)
      }
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
    // max-width: 800px;
    margin: auto;

    .comments {
      margin-top: $space-small;

      .comment {
        margin-top: $space-small;
        position: relative;
      }
    }

    .ds-card-image {
      img {
        max-height: 300px;
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
</style>
