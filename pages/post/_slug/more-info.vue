<template>
  <ds-card>
    <h2 style="margin-bottom: .2em;">
      Mehr Informationen
    </h2>
    <p>Hier findest du weitere infos zum Thema.</p>
    <ds-space />
    <h3><ds-icon name="compass" /> Themenkategorien</h3>
    <div class="tags">
      <ds-icon
        v-for="category in post.categories"
        :key="category.id"
        v-tooltip="{content: category.name, placement: 'top-start', delay: { show: 300 }}"
        :name="category.icon"
        size="large"
      />&nbsp;
      <!--<ds-tag
        v-for="category in post.categories"
        :key="category.id"><ds-icon :name="category.icon" /> {{ category.name }}</ds-tag>-->
    </div>
    <template v-if="post.tags && post.tags.length">
      <h3><ds-icon name="tags" /> Schlagwörter</h3>
      <div class="tags">
        <ds-tag
          v-for="tag in post.tags"
          :key="tag.id"
        >
          <ds-icon name="tag" /> {{ tag.name }}
        </ds-tag>
      </div>
    </template>
    <h3>Verwandte Beiträge</h3>
    <ds-section style="margin: 0 -1.5rem; padding: 1.5rem;">
      <ds-flex
        v-if="post.relatedContributions && post.relatedContributions.length"
        gutter="small"
      >
        <ds-flex-item
          v-for="relatedPost in post.relatedContributions"
          :key="relatedPost.id"
          :width="{ base: '50%' }"
        >
          <hc-post-card :post="relatedPost" />
        </ds-flex-item>
      </ds-flex>
      <hc-empty
        v-else
        margin="large"
        icon="file"
        message="No related Posts"
      />
    </ds-section>
    <ds-space margin-bottom="large" />
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import HcPostCard from '~/components/PostCard.vue'
import HcEmpty from '~/components/Empty.vue'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  components: {
    HcPostCard,
    HcEmpty
  },
  computed: {
    post() {
      return this.Post ? this.Post[0] || {} : {}
    }
  },
  apollo: {
    Post: {
      query() {
        return gql(`
          query Post($slug: String!) {
            Post(slug: $slug) {
              id
              title
              tags {
                id
                name
              }
              categories {
                id
                name
                icon
              }
              relatedContributions(first: 2) {
                id
                title
                slug
                contentExcerpt
                shoutedCount
                commentsCount
                categories {
                  id
                  name
                  icon
                }
                author {
                  id
                  name
                  slug
                  avatar
                  contributionsCount
                  followedByCount
                  commentsCount
                  location {
                    name: name${this.$i18n.locale().toUpperCase()}
                  }
                  badges {
                    id
                    key
                    icon
                  }
                }
              }
              shoutedCount
            }
          }
        `)
      },
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
.related-post {
  box-shadow: $box-shadow-base;

  .ds-card-image {
    max-height: 80px;
  }
}
</style>
