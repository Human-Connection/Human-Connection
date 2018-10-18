<template>
  <ds-flex
    :width="{ base: '100%' }"
    gutter="base">
    <ds-flex-item
      v-for="post in Post"
      :width="{ base: '100%', xs: '100%', md: '50%', xl: '33%' }"
      :key="post.id">
      <hc-post-card :post="post" />
    </ds-flex-item>
  </ds-flex>
</template>

<script>
import gql from 'graphql-tag'
import HcPostCard from '~/components/PostCard.vue'

export default {
  components: {
    HcPostCard
  },
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
          Post(first:10) {
            id
            title
            contentExcerpt
            slug
            image
            author {
              User {
                id
                avatar
                slug
                name
                contributionsCount
                shoutedCount
                commentsCount
                followedByCount
              }
            }
            commentsCount
            categories {
              id
              name
            }
            shoutedCount
          }
        }
      `)
    }
  }
}
</script>
