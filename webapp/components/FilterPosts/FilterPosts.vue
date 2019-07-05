<template>
  <dropdown class="avatar-menu">
    <dropdown ref="menu" :placement="placement" :offset="offset">
      <a
        slot="default"
        slot-scope="{ toggleMenu }"
        class="locale-menu"
        href="#"
        @click.prevent="toggleMenu()"
      >
        <ds-icon style="margin: 5px 0px 0px 10px;" name="filter" size="large" />
        <ds-icon style="margin-left: 2px" size="xx-small" name="angle-down" />
      </a>
      <ds-menu
        slot="popover"
        slot-scope="{ toggleMenu }"
        class="locale-menu-popover"
        :routes="routes"
      >
        <ds-menu-item
          slot="menuitem"
          slot-scope="item"
          class="locale-menu-item"
          :route="item.route"
          @click.stop.prevent="filterPosts(item.route.name, toggleMenu)"
        >
          <ds-icon :name="item.route.icon" />
          {{ item.route.name }}
        </ds-menu-item>
      </ds-menu>
    </dropdown>
  </dropdown>
</template>
<script>
import Dropdown from '~/components/Dropdown'
import { filterPosts } from '~/graphql/PostQuery.js'
import { mapMutations } from 'vuex'

export default {
  components: {
    Dropdown,
  },
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' },
    categories: { type: Array, default: () => [] },
  },
  data() {
    return {
      pageSize: 12,
    }
  },
  computed: {
    routes() {
      let routes = this.categories.map(category => {
        return {
          name: category.name,
          id: category.id,
          icon: category.icon,
        }
      })
      return routes
    },
  },
  methods: {
    ...mapMutations({
      setPosts: 'posts/SET_POSTS',
    }),
    filterPosts(name) {
      this.filter = { categories_some: { name } }
      this.$apollo
        .query({
          query: filterPosts(this.$i18n),
          variables: {
            filter: this.filter,
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
