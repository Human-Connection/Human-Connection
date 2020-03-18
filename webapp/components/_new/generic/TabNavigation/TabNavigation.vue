<template>
  <ul class="tabs">
    <li v-for="tab in tabs" :key="tab.type" class="tab">
      <button :class="{ '--active': activeTab === tab.type }" @click="$emit('switchTab', tab.type)">
        {{ tab.title }}
      </button>
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
.tabs {
  overflow: hidden;

  > .tab {
    display: inline-block;
    color: darkgrey;
    margin: $space-small;

    > button {
      display: block;
      font-weight: bold;
      color: #555;
      padding: 20px;
      border-radius: 5px 5px 0 0;
      border-right: 1px solid #ccc;
    }

    .--active {
      background: $background-color-softer-active;
    }
  }
}
</style>
