<template>
  <dropdown offset="8">
    <template #default="{ toggleMenu }">
      <a
        :v-model="selected"
        name="dropdown"
        class="dropdown-filter"
        href="#"
        @click.prevent="toggleMenu()"
      >
        <base-icon name="filter" />
        <label class="label" for="dropdown">{{ selected }}</label>
        <base-icon class="dropdown-arrow" name="angle-down" />
      </a>
    </template>
    <template #popover="{ toggleMenu }">
      <ds-menu class="dropdown-menu-popover" :routes="filterOptions">
        <template #menuitem="item">
          <ds-menu-item
            class="dropdown-menu-item"
            :route="item.route"
            :parents="item.parents"
            @click.stop.prevent="filter(item.route, toggleMenu)"
          >
            {{ item.route.label }}
          </ds-menu-item>
        </template>
      </ds-menu>
    </template>
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
    filter(option, toggleMenu) {
      this.$emit('filter', option)
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

  > .label {
    margin: 0 $space-xx-small;
  }
}

.dropdown-menu {
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
  padding: $space-xx-small;
  color: $text-color-soft;
}

.dropdown-menu-popover {
  a {
    padding: $space-x-small $space-small;
    padding-right: $space-base;
  }
}
</style>
