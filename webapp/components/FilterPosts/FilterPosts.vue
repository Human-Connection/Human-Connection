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
          :parents="item.parents"
          @click.stop.prevent="filterPostsByCategory(item.route.name, toggleMenu)"
        >
          <ds-icon :name="item.route.icon" />
          {{ item.route.name }}
        </ds-menu-item>
      </ds-menu>
    </dropdown>
  </dropdown>
</template>
<script>
import gql from 'graphql-tag'
import Dropdown from '~/components/Dropdown'

export default {
  components: {
    Dropdown,
  },
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' },
    categories: { type: Array, default: () => [] },
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
    filterPostsByCategory(name) {
      const filterPostsByCategoryMutation = gql`
        query($name: String) {
          Post(filter: { categories_some: { name: $name } }) {
            title
            id
            categories {
              name
            }
          }
        }
      `
      setTimeout(() => {
        this.$apollo
          .mutate({
            mutation: filterPostsByCategoryMutation,
            variables: { name },
          })
          .then(res => {
            // update the Post query
          })
      }, 500)
    },
  },
}
</script>
