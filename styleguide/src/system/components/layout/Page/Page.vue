<template>
  <div
    class="ds-page"
    :class="[
      hasHeader ? 'ds-page-has-header' : 'ds-page-has-no-header',
      $slots.sidebar && 'ds-page-has-sidebar',
      showDrawer && 'ds-page-show-drawer',
      contained && 'ds-page-is-contained'
    ]"
  >
    <header
      class="ds-page-header">
      <div class="ds-page-header-container">
        <div class="ds-page-brand">
          <!-- @slot Content of the page's brand -->
          <slot name="brand"/>
        </div>
        <div class="ds-page-navbar">
          <!-- @slot Content of the navbar -->
          <slot name="navbar"/>
        </div>
        <div
          v-if="$slots.drawer"
          class="ds-page-navigation-toggle"
          @click="showDrawer = !showDrawer">
          <ds-icon name="bars"/>
        </div>
      </div>
    </header>
    <aside
      v-if="$slots.sidebar"
      class="ds-page-sidebar">
      <div class="ds-page-sidebar-content">
        <!-- @slot Content of the sidebar -->
        <slot name="sidebar" />
      </div>
    </aside>
    <aside
      v-if="$slots.drawer"
      class="ds-page-drawer">
      <!-- @slot Content of the drawer (mobile navigation) -->
      <slot name="drawer" />
    </aside>
    <main class="ds-page-content">
      <slot />
    </main>
  </div>
</template>

<script>
/**
 * This component is used to layout a page.
 * @version 1.0.0
 */
export default {
  name: 'DsPage',
  props: {
    /**
     * Whether the layout should have a maximum width
     */
    contained: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showDrawer: false
    }
  },
  computed: {
    hasHeader() {
      return this.$slots.navbar
    }
  },
  methods: {
    closeDrawer() {
      this.showDrawer = false
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
