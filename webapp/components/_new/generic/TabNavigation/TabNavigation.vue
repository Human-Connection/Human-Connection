<template>
  <ul class="tab-navigation">
    <li
      v-for="tab in tabs"
      :key="tab.type"
      :class="[
        activeTab === tab.type && '--active',
        tab.disabled && '--disabled',
        'tab',
        tab.type + '-tab',
      ]"
      role="button"
      @click="$emit('switchTab', tab.type)"
    >
      {{ tab.title }}
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    activeTab: {
      type: String,
    },
  },
}
</script>

<style lang="scss">
.tab-navigation {
  display: flex;
  margin-top: $space-small;

  > .tab {
    font-weight: $font-weight-bold;
    padding: $space-x-small $space-small;
    margin-right: $space-xx-small;
    border-radius: $border-radius-base $border-radius-base 0 0;
    background: $color-neutral-100;
    cursor: pointer;

    &.--active {
      background: $color-neutral-80;
      border: none;
    }

    &.--disabled {
      background: $background-color-disabled;
      border: $border-size-base solid $color-neutral-80;
      border-bottom: none;
      pointer-events: none;
      cursor: default;
    }

    &:hover:not(.--active) {
      background: $color-neutral-85;
    }
  }
}
</style>
