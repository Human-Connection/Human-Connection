<template>
  <dropdown ref="menu" :placement="placement" :offset="offset">
    <ds-button
      slot="default"
      slot-scope="{ toggleMenu }"
      icon="globe"
      name="select language"
      ghost
      @click.prevent="toggleMenu()"
    >
      {{ current.code.toUpperCase() }}
    </ds-button>
    <ds-menu
      slot="popover"
      slot-scope="{ toggleMenu }"
      class="locale-menu-popover"
      :matcher="matcher"
      :routes="routes"
    >
      <ds-menu-item
        slot="menuitem"
        slot-scope="item"
        class="locale-menu-item"
        :route="item.route"
        :parents="item.parents"
        @click.stop.prevent="changeLanguage(item.route.path, toggleMenu)"
      >
        {{ item.route.name }}
      </ds-menu-item>
    </ds-menu>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import find from 'lodash/find'
import orderBy from 'lodash/orderBy'
import locales from '~/locales'

export default {
  components: {
    Dropdown,
  },
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' },
  },
  data() {
    return {
      locales: orderBy(locales, 'name'),
    }
  },
  computed: {
    current() {
      return find(this.locales, { code: this.$i18n.locale() })
    },
    routes() {
      let routes = this.locales.map(locale => {
        return {
          name: locale.name,
          path: locale.code,
        }
      })
      return routes
    },
  },
  methods: {
    changeLanguage(locale, toggleMenu) {
      this.$i18n.set(locale)
      toggleMenu()
    },
    matcher(locale) {
      return locale === this.$i18n.locale()
    },
  },
}
</script>

<style lang="scss">
.topbar-locale-switch {
  .ds-button-text {
    font-weight: normal;
    margin-left: $space-xxx-small;
  }
}

nav.locale-menu-popover {
  margin-left: -$space-small !important;
  margin-right: -$space-small !important;

  a {
    padding: $space-x-small $space-small;
    padding-right: $space-base;
  }
}
</style>
