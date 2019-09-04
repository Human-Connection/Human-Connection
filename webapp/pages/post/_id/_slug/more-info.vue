<template>
  <ds-card>
    <h2 style="margin-bottom: .2em;">{{ $t('post.moreInfo.title') }}</h2>
    <p>{{ $t('post.moreInfo.description') }}</p>
    <ds-space />
    <h3>
      <!-- <ds-icon name="compass" /> -->
      {{ $t('post.moreInfo.titleOfCategoriesSection') }}
    </h3>
    <div class="tags">
      <ds-icon
        v-for="category in post.categories"
        :key="category.id"
        v-tooltip="{ content: category.name, placement: 'top-start', delay: { show: 300 } }"
        :name="category.icon"
        size="large"
      />
      &nbsp;
      <!--<ds-tag
        v-for="category in post.categories"
      :key="category.id"><ds-icon :name="category.icon" /> {{ category.name }}</ds-tag>-->
    </div>
    <template v-if="post.tags && post.tags.length">
      <h3>
        <!-- <ds-icon name="tags" /> -->
        {{ $t('post.moreInfo.titleOfHashtagsSection') }}
      </h3>
      <div class="tags">
        <ds-tag v-for="tag in post.tags" :key="tag.id">
          <ds-icon name="tag" />
          {{ tag.name }}
        </ds-tag>
      </div>
    </template>
    <h3>{{ $t('post.moreInfo.titleOfRelatedContributionsSection') }}</h3>
    <ds-section>
      <masonry-grid v-if="post.relatedContributions && post.relatedContributions.length">
        <masonry-grid-item v-for="relatedPost in post.relatedContributions" :key="relatedPost.id">
          <hc-post-card
            :post="relatedPost"
            :width="{ base: '100%', lg: 1 }"
            @removePostFromList="removePostFromList"
          />
        </masonry-grid-item>
      </masonry-grid>
      <hc-empty v-else margin="large" icon="file" message="No related Posts" />
    </ds-section>
  </ds-card>
</template>

<script>
import HcPostCard from '~/components/PostCard'
import HcEmpty from '~/components/Empty.vue'
import { relatedContributions } from '~/graphql/PostQuery'
import MasonryGrid from '~/components/MasonryGrid/MasonryGrid.vue'
import MasonryGridItem from '~/components/MasonryGrid/MasonryGridItem.vue'

export default {
  transition: {
    name: 'slide-up',
    mode: 'out-in',
  },
  components: {
    HcPostCard,
    HcEmpty,
    MasonryGrid,
    MasonryGridItem,
  },
  computed: {
    post() {
      return this.Post ? this.Post[0] || {} : {}
    },
  },
  methods: {
    removePostFromList(deletedPost) {
      this.post.relatedContributions = this.post.relatedContributions.filter(contribution => {
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

  .ds-card-image {
    max-height: 80px;
  }
}
</style>
