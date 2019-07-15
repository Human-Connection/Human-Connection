<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <a slot="default" slot-scope="{ toggleMenu }" href="#" @click.prevent="toggleMenu()">
      <ds-icon style="margin: 12px 0px 0px 10px;" name="filter" size="large" />
      <ds-icon style="margin: 7px 0px 0px 2px" size="xx-small" name="angle-down" />
    </a>
    <template slot="popover">
      <filter-posts-menu-items :chunk="chunk" @filterPosts="filterPosts" />
    </template>
  </dropdown>
</template>
<script>
import _ from 'lodash'
import Dropdown from '~/components/Dropdown'
import { filterPosts } from '~/graphql/PostQuery.js'
import { mapMutations } from 'vuex'
import FilterPostsMenuItems from '~/components/FilterPosts/FilterPostsMenuItems'

export default {
  components: {
    Dropdown,
    FilterPostsMenuItems,
  },
  props: {
    placement: { type: String },
    offset: { type: [String, Number] },
    categories: { type: Array, default: () => [] },
  },
  data() {
    return {
      pageSize: 12,
    }
  },
  computed: {
    chunk() {
      return _.chunk(this.categories, 2)
    },
  },
  methods: {
    ...mapMutations({
      setPosts: 'posts/SET_POSTS',
    }),
    filterPosts(categoryIds) {
      const filter = categoryIds.length ? { categories_some: { id_in: categoryIds } } : {}
      this.$apollo
        .query({
          query: filterPosts(this.$i18n),
          variables: {
            filter: filter,
            first: this.pageSize,
            offset: 0,
          },
        })
        .then(({ data: { Post } }) => {
          this.setPosts(Post)
        })
        .catch(error => this.$toast.error(error.message))
    },
  },
}
</script>
