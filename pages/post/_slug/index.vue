<template>
  <ds-card
    v-if="post"
    :image="post.image"
    :header="post.title"
    class="post-card">
    <hc-author :post="post" />
    <ds-space margin-bottom="small" />
    <!-- Content -->
    <div
      class="content hc-editor-content"
      v-html="post.content" />
    <!-- Shout Button -->
    <ds-space margin="xx-large" />
    <hc-shout-button
      v-if="post.author"
      :count="post.shoutedCount"
      :post-id="post.id" />
    <!-- Categories -->
    <ds-icon
      v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
      v-for="category in post.categories"
      :key="category.id"
      :name="category.icon"
      size="large" />&nbsp;
    <ds-space margin-bottom="small" />
    <!--<div class="tags">
      <ds-icon name="compass" /> <ds-tag
        v-for="category in post.categories"
        :key="category.id"><ds-icon :name="category.icon" /> {{ category.name }}</ds-tag>
    </div>-->
    <!-- Tags -->
    <template v-if="post.tags && post.tags.length">
      <ds-space margin="xx-small"/>
      <div class="tags">
        <ds-icon name="tags" /> <ds-tag
          v-for="tag in post.tags"
          :key="tag.id"><ds-icon name="tag" /> {{ tag.name }}</ds-tag>
      </div>
    </template>
    <ds-space margin="small"/>
    <!-- Comments -->
    <ds-section
      slot="footer">
      <h3 style="margin-top: 0;">
        <span>
          <ds-icon name="comments" />
          <ds-tag
            v-if="post.commentsCount"
            style="transform: scale(.8); margin-top: -4px; margin-left: -12px; position: absolute;"
            color="primary"
            round>
            {{ post.commentsCount }}
          </ds-tag> &nbsp; Comments
        </span>
      </h3>
      <ds-space margin-bottom="large" />
      <div
        v-if="post.commentsCount"
        id="comments"
        class="comments">
        <div
          v-for="comment in post.comments"
          :key="comment.id"
          class="comment">
          <ds-space margin-bottom="x-small">
            <hc-author :post="comment" />
          </ds-space>
          <div
            v-if="!comment.deleted"
            style="padding-left: 40px;"
            v-html="comment.contentExcerpt" />
          <ds-text
            v-else
            style="padding-left: 40px; font-weight: bold;"
            color="soft"><ds-icon name="ban" /> Vom Benutzer gelöscht</ds-text>
        </div>
        <ds-space margin-bottom="small" />
      </div>
      <div v-else>
        <p style="text-align: center; opacity: .5;">NO COMMENTS</p>
      </div>
    </ds-section>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import HcAuthor from '~/components/Author.vue'
import HcShoutButton from '~/components/ShoutButton.vue'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  components: {
    HcAuthor,
    HcShoutButton
  },
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      post: null,
      title: 'loading'
    }
  },
  watch: {
    Post(post) {
      this.post = post[0]
      this.title = this.post.title
    }
  },
  apollo: {
    Post: {
      query: gql(`
        query Post($slug: String!) {
          Post(slug: $slug) {
            id
            title
            content
            createdAt
            slug
            image
            author {
              User {
                id
                slug
                name
                avatar
                shoutedCount
                contributionsCount
                commentsCount
                followedByCount
                badges {
                  id
                  key
                  icon
                }
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
                User {
                  id
                  slug
                  name
                  avatar
                  shoutedCount
                  contributionsCount
                  commentsCount
                  followedByCount
                  badges {
                    id
                    key
                    icon
                  }
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
      `),
      variables() {
        return {
          slug: this.$route.params.slug
        }
      },
      fetchPolicy: 'cache-and-network'
    }
  }
}
</script>

<style lang="scss">
@import 'vue-cion-design-system/src/system/tokens/generated/tokens.scss';

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
</style>
