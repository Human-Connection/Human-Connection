<template>
  <dropdown offset="8">
    <a
      slot="default"
      slot-scope="{ toggleMenu }"
      class="locale-menu"
      href="#"
      @click.prevent="toggleMenu()"
    >
      <ds-icon style="margin-right: 2px;" name="filter" />
      {{ selected }}
      <ds-icon style="margin-left: 2px" size="xx-small" name="angle-down" />
    </a>
    <ds-menu
      slot="popover"
      slot-scope="{ toggleMenu }"
      class="locale-menu-popover"
      :routes="filterOptions"
    >
      <ds-menu-item
        slot="menuitem"
        slot-scope="item"
        class="locale-menu-item"
        :route="item.route"
        :parents="item.parents"
        @click.stop.prevent="filterNotifications(item.route, toggleMenu)"
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
      selected: this.$t('notifications.filterLabel.all'),
    }
  },
  computed: {
    filterOptions() {
      return [
        { label: this.$t('notifications.filterLabel.all'), value: null },
        { label: this.$t('notifications.filterLabel.read'), value: true },
        { label: this.$t('notifications.filterLabel.unread'), value: false },
      ]
    },
  },
  methods: {
    filterNotifications(option, toggleMenu) {
      this.$emit('filterNotifications', option.value)
      this.selected = option.label
      toggleMenu()
    },
  },
}
</script>
