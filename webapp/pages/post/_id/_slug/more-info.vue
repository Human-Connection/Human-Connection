<template>
  <base-card>
    <h2 class="title">{{ $t('post.moreInfo.title') }}</h2>
    <p>{{ $t('post.moreInfo.description') }}</p>
    <ds-space />
    <h3>{{ $t('post.moreInfo.titleOfCategoriesSection') }}</h3>
    <hc-category
      v-for="category in post.categories"
      :key="category.id"
      :icon="category.icon"
      :name="$t(`contribution.category.name.${category.slug}`)"
    />
    <template v-if="post.tags && post.tags.length">
      <h3>
        {{ $t('post.moreInfo.titleOfHashtagsSection') }}
      </h3>
      <hc-hashtag v-for="tag in sortedTags" :key="tag.id" :id="tag.id" />
    </template>
    <h3>{{ $t('post.moreInfo.titleOfRelatedContributionsSection') }}</h3>
    <ds-section>
      <masonry-grid v-if="post.relatedContributions && post.relatedContributions.length">
        <masonry-grid-item
          v-for="relatedPost in post.relatedContributions"
          :key="relatedPost.id"
          :imageAspectRatio="relatedPost.imageAspectRatio"
        >
          <post-teaser
            :post="relatedPost"
            :width="{ base: '100%', lg: 1 }"
            @removePostFromList="removePostFromList"
          />
        </masonry-grid-item>
      </masonry-grid>
      <hc-empty v-else margin="large" icon="file" message="No related Posts" />
    </ds-section>
  </base-card>
</template>

<script>
import HcEmpty from '~/components/Empty/Empty'
import PostTeaser from '~/components/PostTeaser/PostTeaser.vue'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import { relatedContributions } from '~/graphql/PostQuery'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'
import { sortTagsAlphabetically } from '~/components/utils/PostHelpers'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    PostTeaser,
    HcCategory,
    HcHashtag,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
  },
  computed: {
    post() {
      return this.Post ? this.Post[0] || {} : {}
    },
    sortedTags() {
      return sortTagsAlphabetically(this.post.tags)
    },
  },
  methods: {
    removePostFromList(deletedPost) {
      this.post.relatedContributions = this.post.relatedContributions.filter((contribution) => {
        return contribution.id !== deletedPost.id
      })
    },
  },
  apollo: {
    Post: {
      query() {
        return relatedContributions(this.$i18n)
      },
      variables() {
        return {
          slug: this.$route.params.slug,
        }
      },
    },
  },
}
</script>

<style lang="scss">
.related-post {
  box-shadow: $box-shadow-base;
}
</style>
