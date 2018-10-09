<template>
  <div class="navigation">
    <ds-menu
      @navigate="$emit('navigate')"
      :routes="routes"
      :url-parser="urlParser"
      :name-parser="nameParser"
      :is-exact="isExact"/>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
  computed: {
    routes() {
      const routes = this.$router.options.routes.filter(route => {
        return route.path !== '*'
      })
      return routes.map(route => {
        const [parent, ...children] = [...route.children]
        parent.children = children
        return parent
      })
    }
  },
  methods: {
    nameParser(route) {
      return this.$options.filters.componentName(route.name)
    },
    urlParser(route) {
      return {
        name: route.name
      }
    },
    isExact(url) {
      return url.name === 'Introduction'
    }
  }
}
</script>

<style lang="scss" scoped>
.navigation {
  padding: $space-base $space-x-small;
}
</style>
