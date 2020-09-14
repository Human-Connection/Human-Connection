<template>
  <div class="organization-list">
    <base-card v-if="Organization && Organization.length">
      <div align="right">
        <nuxt-link to="/organization/create">
          <base-button filled>{{ $t('organizations.add') }}</base-button>
        </nuxt-link>
      </div>
      <h2 class="title">{{ $t('organizations.name') }}</h2>
      <ul v-if="Organization">
        <li v-for="orga in Organization" :key="orga.id" class="item">
          <base-card :wideContent="true">
            <nuxt-link :to="organizationLink(orga)">
              <ds-text>{{ orga.name }}</ds-text>
              <ds-text v-if="orga.location" align="left" color="soft" size="small">
                <base-icon name="map-marker" />
                {{ orga.location.name }}
              </ds-text>
              <div class="categories">
                <hc-category
                  v-for="category in orga.categories"
                  :key="category.id"
                  :icon="category.icon"
                  :name="$t(`contribution.category.name.${category.slug}`)"
                />
              </div>
            </nuxt-link>
            <!-- Tags -->
            <div v-if="orga.tags && orga.tags.length" class="tags">
              <ds-space margin="xx-small" />
              <hc-hashtag v-for="tag in sortedTags(orga.tags)" :key="tag.id" :id="tag.id" />
            </div>
          </base-card>
        </li>
      </ul>
      <pagination-buttons :hasNext="hasNext" :hasPrevious="hasPrevious" @next="next" @back="back" />
    </base-card>
  </div>
</template>
<script>
import gql from 'graphql-tag'
import HcCategory from '~/components/Category'
import HcHashtag from '~/components/Hashtag/Hashtag'
import { sortTagsAlphabetically } from '~/components/utils/PostHelpers'
import PaginationButtons from '~/components/_new/generic/PaginationButtons/PaginationButtons'

export default {
  components: {
    HcHashtag,
    HcCategory,
    PaginationButtons,
  },
  data() {
    const pageSize = 15
    return {
      offset: 0,
      pageSize,
      first: pageSize,
      Organization: [],
      hasNext: false,
      filter: null,
      form: {
        formData: {
          query: '',
        },
      },
    }
  },
  computed: {
    hasPrevious() {
      return this.offset > 0
    },
  },
  methods: {
    organizationLink(orga) {
      const { id, slug } = orga
      if (!(id && slug)) return ''
      return `/organization/${id}/${slug}`
    },
    sortedTags(tags) {
      return sortTagsAlphabetically(tags)
    },
    back() {
      this.offset = Math.max(this.offset - this.pageSize, 0)
    },
    next() {
      this.offset += this.pageSize
    },
  },
  apollo: {
    Organization: {
      query() {
        return gql`
          query($first: Int, $offset: Int) {
            Organization(first: $first, offset: $offset) {
              id
              name
              slug
              location {
                name
              }
              categories {
                name
                icon
                slug
              }
              tags {
                id
              }
            }
          }
        `
      },
      variables() {
        const { offset, first } = this
        const variables = { first, offset }
        return variables
      },
      update({ Organization }) {
        if (!Organization) return []
        this.hasNext = Organization.length >= this.pageSize
        if (Organization.length <= 0 && this.offset > 0) return this.Organization // edge case, avoid a blank page
        return Organization.map((o, i) => Object.assign({}, o, { index: this.offset + i }))
      },
    },
  },
}
</script>
<style lang="scss"></style>
