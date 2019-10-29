<template>
  <dropdown>
    <a
      slot="default"
      slot-scope="{ toggleMenu }"
      class="locale-menu"
      href="#"
      @click.prevent="toggleMenu()"
    >
      <ds-icon style="margin-right: 2px;" name="sort" />
      {{ selected }}
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
        @click.stop.prevent="sortNotifications(item.route, toggleMenu)"
      >
        {{ item.route.label }}
      </ds-menu-item>
    </ds-menu>
  </dropdown>
</template>
<script>
import Dropdown from '~/components/Dropdown'

export default {
  components: {
    Dropdown,
  },
  data() {
    return {
      selected: this.$t('notifications.sortingLabel.all'),
      sortingOptions: [
        { label: this.$t('notifications.sortingLabel.all'), value: null },
        { label: this.$t('notifications.sortingLabel.read'), value: true },
        { label: this.$t('notifications.sortingLabel.unread'), value: false },
      ],
    }
  },
  computed: {
    routes() {
      let routes = this.sortingOptions.map(option => {
        return {
          label: option.label,
          value: option.value,
        }
      })
      return routes
    },
  },
  methods: {
    sortNotifications(option, toggleMenu) {
      this.$emit('sortNotifications', option)
      this.selected = option.label
      toggleMenu()
    },
  },
}
</script>
