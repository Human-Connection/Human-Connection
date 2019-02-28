<template>
  <transition
    name="fade"
    appear
  >
    <ds-card
      v-if="post && ready"
      :image="post.image"
      :header="post.title"
      class="post-card"
    >
      <hc-author :post="post" />
      <no-ssr>
        <content-menu
          placement="bottom-end"
          context="contribution"
          :item-id="post.id"
          :name="post.title"
          :is-owner="isAuthor(post.author.id)"
        />
      </no-ssr>
      <ds-space margin-bottom="small" />
      <!-- Content -->
      <!-- eslint-disable vue/no-v-html -->
      <!-- TODO: replace editor content with tiptap render view -->
      <div
        class="content hc-editor-content"
        v-html="post.content"
      />
      <!-- eslint-enable vue/no-v-html -->
      <!-- Shout Button -->
      <ds-space margin="xx-large" />
      <hc-shout-button
        v-if="post.author"
        :count="post.shoutedCount"
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
      <!--<div class="tags">
      <ds-icon name="compass" /> <ds-tag
        v-for="category in post.categories"
        :key="category.id"
      >
        {{ category.name }}
      </ds-tag>
    </div>-->
      <!-- Tags -->
      <template v-if="post.tags && post.tags.length">
        <ds-space margin="xx-small" />
        <div class="tags">
          <ds-icon name="tags" /> <ds-tag
            v-for="tag in post.tags"
            :key="tag.id"
          >
            <ds-icon name="tag" /> {{ tag.name }}
          </ds-tag>
        </div>
      </template>
      <ds-space margin="small" />
      <!-- Comments -->
      <ds-section slot="footer">
        <h3 style="margin-top: 0;">
          <span>
            <ds-icon name="comments" />
            <ds-tag
              v-if="post.commentsCount"
              style="margin-top: -4px; margin-left: -12px; position: absolute;"
              color="primary"
              size="small"
              round
            >
              {{ post.commentsCount }}
            </ds-tag> &nbsp; Comments
          </span>
        </h3>
        <ds-space margin-bottom="large" />
        <div
          v-if="post.commentsCount"
          id="comments"
          class="comments"
        >
          <div
            v-for="comment in post.comments"
            :key="comment.id"
            class="comment"
          >
            <ds-space margin-bottom="x-small">
              <hc-author :post="comment" />
            </ds-space>
            <no-ssr>
              <content-menu
                placement="bottom-end"
                context="comment"
                style="float-right"
                :item-id="comment.id"
                :name="comment.author.name"
                :is-owner="isAuthor(comment.author.id)"
              />
            </no-ssr>
            <!-- eslint-disable vue/no-v-html -->
            <!-- TODO: replace editor content with tiptap render view -->
            <div
              v-if="!comment.deleted"
              style="padding-left: 40px;"
              v-html="comment.contentExcerpt"
            />
            <!-- eslint-enable vue/no-v-html -->
            <ds-text
              v-else
              style="padding-left: 40px; font-weight: bold;"
              color="soft"
            >
              <ds-icon name="ban" /> Vom Benutzer gelöscht
            </ds-text>
          </div>
          <ds-space margin-bottom="small" />
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
import ContentMenu from '~/components/ContentMenu'
import HcAuthor from '~/components/Author.vue'
import HcShoutButton from '~/components/ShoutButton.vue'
import HcEmpty from '~/components/Empty.vue'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  components: {
    HcAuthor,
    HcShoutButton,
    HcEmpty,
    ContentMenu
  },
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      ready: false
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
              slug
              image
              author {
                id
                slug
                name
                avatar
                shoutedCount
                contributionsCount
                commentsCount
                followedByCount
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
                deleted
                author {
                  id
                  slug
                  name
                  avatar
                  shoutedCount
                  contributionsCount
                  commentsCount
                  followedByCount
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
            }
          }
        `)
    const variables = { slug: params.slug }
    const {
      data: { Post }
    } = await client.query({ query, variables })
    if (Post.length <= 0) {
      return error({ statusCode: 404, message: 'We cannot find that post :(' })
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
    }
  }
}
</script>

<style lang="scss">
.page-name-post-slug {
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
