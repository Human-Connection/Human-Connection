<template>
  <dropdown offset="8">
    <a
      :v-model="selected"
      slot="default"
      slot-scope="{ toggleMenu }"
      name="dropdown"
      class="dropdown-filter"
      href="#"
      @click.prevent="toggleMenu()"
    >
      <ds-icon style="margin-right: 2px;" name="filter" />
      <label for="dropdown">{{ selected }}</label>
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
  props: {
    selected: { type: String, default: '' },
    filterOptions: { type: Array, default: () => [] },
  },
  methods: {
    filterNotifications(option, toggleMenu) {
      this.$emit('filterNotifications', option)
      toggleMenu()
    },
  },
}
</script>
<style lang="scss">
.dropdown-filter {
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
  padding: $space-xx-small;
  color: $text-color-soft;
}
</style>
