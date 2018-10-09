<template>
  <div>
    <no-ssr>
      <ds-flex
        :width="{ base: '100%' }"
        gutter="base">
        <ds-flex-item
          v-for="post in Post"
          :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
          :key="post.id">
          <a
            v-router-link
            :href="href(post)"
          >
            <ds-card
              :header="post.title"
              :image="post.image"
              style="cursor: pointer">
              <ds-avatar
                :image="post.author.User.avatar"
                size="32px" /> <b class="username">{{ post.author.User.name }}</b>
              <ds-space />
              <div v-html="post.contentExcerpt" />
              <template slot="footer">
                <span>
                  <ds-icon name="comments" /> <small v-if="post.commentsCount">{{ post.commentsCount }}</small>
                </span>
                &nbsp;
                <span>
                  <ds-icon name="heart-o" /> <small v-if="post.shoutedCount">{{ post.shoutedCount }}</small>
                </span>
              </template>
            </ds-card>
          </a>
        </ds-flex-item>
      </ds-flex>
    </no-ssr>
  </div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return {
      // Initialize your apollo data
      Post: []
    }
  },
  computed: {
    tags() {
      return this.Post ? this.Post[0].tags.map(tag => tag.name) : '-'
    }
  },
  methods: {
    href(post) {
      return this.$router.resolve({
        name: 'post-slug',
        params: { slug: post.slug }
      }).href
    }
  },
  apollo: {
    Post: {
      query: gql(`
        query {
          Post {
            id
            title
            contentExcerpt
            slug
            image
            author {
              User {
                avatar
                slug
                name
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
                  name
                }
              }
            }
            categories {
              name
            }
            shoutedCount
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
          id: this.$route.query.post || 'p1'
        }
      }
    }
  }
}
</script>
