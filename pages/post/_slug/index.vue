<template>
  <ds-card
    v-if="post"
    :image="post.image"
    :header="post.title"
    class="post-card">
    <a
      v-router-link
      :href="$router.resolve({ name: 'profile-slug', params: { slug: post.author.User.slug } }).href">
      <ds-avatar
        :image="post.author.User.avatar"
        size="32px" /> <b class="username">{{ post.author.User.name }}</b>
    </a>
    <ds-space margin-bottom="small" />
    <div
      class="content"
      v-html="post.content" />
    <ds-space margin-top="large"/>
    <div class="tags">
      <ds-icon name="compass" /> <ds-tag
        v-for="category in post.categories"
        :key="category.id">{{ category.name }}</ds-tag>
    </div>
    <template v-if="post.tags && post.tags.length">
      <div class="tags">
        <ds-icon name="tags" /> <ds-tag
          v-for="tag in post.tags"
          :key="tag.id"><ds-icon name="tag" /> {{ tag.name }}</ds-tag>
      </div>
    </template>
    <ds-space margin-bottom="large" />
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
            <a
              v-router-link
              :href="$router.resolve({ name: 'profile-slug', params: { slug: comment.author.User.slug } }).href">
              <ds-avatar
                :image="comment.author.User.avatar"
                size="24px" /> <b class="username">{{ comment.author.User.name }}</b>
            </a>
          </ds-space>
          <div
            style="padding-left: 32px;"
            v-html="comment.content" />
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

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },

  data() {
    return {
      post: null
    }
  },
  watch: {
    Post(post) {
      this.post = post[0]
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
            slug
            image
            author {
              User {
                slug
                name
                avatar
              }
            }
            tags {
              name
            }
            commentsCount
            comments(orderBy: _id_desc) {
              id
              content
              author {
                User {
                  slug
                  name
                  avatar
                }
              }
            }
            categories {
              name
            }
            shoutedBy {
              name
              friends {
                name
              }
            }
          }
        }
      `),
      variables() {
        return {
          slug: this.$route.params.slug
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import 'vue-cion-design-system/src/system/tokens/generated/tokens.scss';

.post-card {
  // max-width: 800px;
  margin: auto;

  .content {
    br {
      display: none;
    }
  }

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
    border-radius: 0 0 $border-radius-large $border-radius-large;
    overflow: hidden;

    .ds-section {
      padding: $space-base;
    }
  }
}
</style>
