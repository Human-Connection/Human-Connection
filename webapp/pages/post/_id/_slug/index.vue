<template>
  <transition
    name="fade"
    appear
  >
    <ds-card
      v-if="post && ready"
      :image="post.image"
      :class="{'post-card': true, 'disabled-content': post.disabled}"
    >
      <ds-space margin-bottom="small" />
      <hc-user
        :user="post.author"
        :date-time="post.createdAt"
      />
      <no-ssr>
        <content-menu
          placement="bottom-end"
          resource-type="contribution"
          :resource="post"
          :is-owner="isAuthor(post.author.id)"
        />
      </no-ssr>
      <ds-space margin-bottom="small" />
      <ds-heading
        tag="h3"
        no-margin
      >
        {{ post.title }}
      </ds-heading>
      <ds-space margin-bottom="small" />
      <!-- Content -->
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <div
        class="content hc-editor-content"
        v-html="post.content"
      />
      <!-- eslint-enable vue/no-v-html -->
      <ds-space margin="xx-large" />
      <!-- Categories -->
      <div class="categories">
        <ds-space margin="xx-small" />
        <hc-category
          v-for="category in post.categories"
          :key="category.id"
          v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
          :icon="category.icon"
          :name="category.name"
        />
      </div>
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <div
        v-if="post.tags && post.tags.length"
        class="tags"
      >
        <ds-space margin="xx-small" />
        <hc-tag
          v-for="tag in post.tags"
          :key="tag.id"
          :name="tag.name"
        />
      </div>
      <!-- Shout Button -->
      <hc-shout-button
        v-if="post.author"
        :disabled="isAuthor(post.author.id)"
        :count="post.shoutedCount"
        :is-shouted="post.shoutedByCurrentUser"
        :post-id="post.id"
      />
      <!-- Categories -->
      <ds-icon
        v-for="category in post.categories"
        :key="category.id"
        v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
        :name="category.icon"
        size="large"
      />&nbsp;
      <ds-space margin-bottom="small" />
      <!-- Tags -->
      <template v-if="post.tags && post.tags.length">
        <ds-space margin="xx-small" />
        <div class="tags">
          <ds-icon name="tags" />
          <ds-tag
            v-for="tag in post.tags"
            :key="tag.id"
          >
            <ds-icon name="tag" />
            {{ tag.name }}
          </ds-tag>
        </div>
      </template>
      <ds-space margin="small" />
      <!-- Comments -->
      <ds-section slot="footer">
        <ds-flex>
          <ds-flex-item width="20%">
            <h3 style="margin-top: 0;">
              <span>
                <ds-icon name="comments" />
                <ds-tag
                  v-if="comments"
                  style="margin-top: -4px; margin-left: -12px; position: absolute;"
                  color="primary"
                  size="small"
                  round
                >{{ comments.length }}</ds-tag>&nbsp; Comments
              </span>
            </h3>
          </ds-flex-item>
          <hc-comment-form :post="post" @addComment="addComment" />
        </ds-flex>
        <ds-space margin-bottom="large" />
        <div
          v-if="comments && comments.length"
          id="comments"
          class="comments"
        >
          <comment
            v-for="comment in comments"
            :key="comment.id"
            :comment="comment"
          />
        </div>
        <hc-empty
          v-else
          icon="messages"
        />
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
import HcEmpty from '~/components/Empty.vue'
import HcCommentForm from '~/components/CommentForm'
import Comment from '~/components/Comment.vue'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  components: {
    HcTag,
    HcCategory,
    HcUser,
    HcShoutButton,
    HcEmpty,
    Comment,
    ContentMenu,
    HcCommentForm
  },
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      post: null,
      comments: null,
      ready: false,
      title: 'loading'
    }
  },
  watch: {
    Post(post) {
      this.post = post[0] || {}
      this.title = this.post.title
    },
    CommentByPost(comments) {
      this.comments = comments || []
    }
  },
  async asyncData(context) {
    const {
      params,
      error,
      app: { apolloProvider, $i18n }
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
      data: { Post }
    } = await client.query({ query, variables })
    if (Post.length <= 0) {
      // TODO: custom 404 error page with translations
      const message = 'This post could not be found'
      return error({ statusCode: 404, message })
    }
    const [post] = Post
    return {
      post,
      title: post.title
    }
  },
  mounted() {
    setTimeout(() => {
      // NOTE: quick fix for jumping flexbox implementation
      // will be fixed in a future update of the styleguide
      this.ready = true
    }, 50)
  },
  methods: {
    isAuthor(id) {
      return this.$store.getters['auth/user'].id === id
    },
    addComment(comment) {
      this.$apollo.queries.CommentByPost.refetch()
    }
  },
  apollo: {
    CommentByPost: {
      query() {
        return require('~/graphql/CommentQuery.js').default(this)
      },
      variables() {
        return {
          postId: this.post.id
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
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
