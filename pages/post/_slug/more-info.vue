<template>
  <ds-card>
    <h2 style="margin-bottom: .2em;">Mehr Informationen</h2>
    <p>Hier findest du weitere infos zum Thema.</p>
    <ds-space/>
    <h3><ds-icon name="compass" /> Themenkategorien</h3>
    <div class="tags">
      <ds-tag
        v-for="category in post.categories"
        :key="category.id">{{ category.name }}</ds-tag>
    </div>
    <template v-if="post.tags && post.tags.length">
      <h3><ds-icon name="tags" /> Schlagwörter</h3>
      <div class="tags">
        <ds-tag
          v-for="tag in post.tags"
          :key="tag.id"><ds-icon name="tag" /> {{ tag.name }}</ds-tag>
      </div>
    </template>
    <h3>Verwandte Beiträge</h3>
    <ds-section style="margin: 0 -1.5rem; padding: 1.5rem;">
      <ds-flex
        v-if="post.relatedContributions && post.relatedContributions.length"
        gutter="small">
        <ds-flex-item
          v-for="relatedPost in post.relatedContributions"
          :key="relatedPost.id"
          :width="{ base: '50%' }">
          <a
            v-router-link
            :href="$router.resolve({ name: 'post-slug', params: { slug: relatedPost.slug } }).href">
            <ds-card
              :image="relatedPost.image"
              :header="relatedPost.title"
              class="related-post">
              <div v-html="relatedPost.contentExcerpt" />
            </ds-card>
          </a>
        </ds-flex-item>
      </ds-flex>
      <ds-space
        v-else
        style="text-align: center; padding-top: 2em; opacity: .6;">
        No related Posts
      </ds-space>
    </ds-section>
    <ds-space margin-bottom="large" />
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in'
  },
  computed: {
    post() {
      return this.Post ? this.Post[0] : {}
    }
  },
  apollo: {
    Post: {
      query: gql(`
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
            }
            relatedContributions(first: 2) {
              id
              title
              slug
              image
              contentExcerpt
              shoutedCount
              commentsCount
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
          slug: this.$route.params.slug
        }
      }
    }
  }
}
</script>

<style lang="scss">
@import 'vue-cion-design-system/src/system/tokens/generated/tokens.scss';

.related-post {
  box-shadow: $box-shadow-base;

  .ds-card-image {
    max-height: 80px;
  }
}
</style>
