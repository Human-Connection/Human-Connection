<template>
  <nav
    class="ds-menu"
    :class="[
      inverse && 'ds-menu-inverse',
      navbar && 'ds-menu-navbar'
    ]"
  >
    <ul class="ds-menu-list">
      <slot>
        <slot
          v-for="(route, index) in routes"
          :route="route"
          :parents="[]"
          :name="route.name">
          <!-- @slot Scoped slot for providing a custom menu item -->
          <slot
            :route="route"
            name="menuitem">
            <ds-menu-item
              :key="route.path ? route.path : index"
              :route="route" />
          </slot>
        </slot>
      </slot>
    </ul>
  </nav>
</template>

<script>
/**
 * Used in combination with the menu item to help the user navigate.
 * @version 1.0.0
 */
export default {
  name: 'DsMenu',
  provide() {
    return {
      $parentMenu: this
    }
  },
  props: {
    /**
     * The routes to display
     */
    routes: {
      type: Array,
      default() {
        return null
      }
    },
    /**
     * Set to true, if you use it on dark background
     */
    inverse: {
      type: Boolean,
      default: false
    },
    /**
     * Display menu as a navbar
     */
    navbar: {
      type: Boolean,
      default: false
    },
    /**
     * The default component / tag used for the link of menu items
     * @options router-link|a
     */
    linkTag: {
      type: String,
      default() {
        return this.$router ? 'router-link' : 'a'
      },
      validator: value => {
        return value.match(/(router-link|a)/)
      }
    },
    /**
     * Function that parses the url for each menu item
     */
    urlParser: {
      type: Function,
      default(route, parents) {
        if (route.path) {
          return route.path
        }
        const parseName = this.$options.filters.kebabCase
        const routeParts = [...parents, route].map(p => parseName(p.name))
        return '/' + routeParts.join('/')
      }
    },
    /**
     * Function that parses the name for each menu item
     */
    nameParser: {
      type: Function,
      default(route) {
        return route.name
      }
    },
    /**
     * Function that checks if the url must be matched exactly in order to activate the menu item. By default only '/' must be matched exactly.
     */
    isExact: {
      type: Function,
      default(url) {
        return url === '/' || url.path === '/'
      }
    }
  },
  computed: {},
  methods: {
    handleNavigate() {
      /**
       * Menu navigates to route.
       *
       * @event navigate
       */
      this.$emit('navigate')
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
