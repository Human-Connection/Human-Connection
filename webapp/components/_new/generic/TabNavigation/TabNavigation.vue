<template>
  <ul class="tabs">
    <li v-for="tab in tabs" :key="tab.type" class="tab">
      <button @click="$emit('openTab', tab.type)">
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
    }
  },
}
</script>
