<template>
  <ds-card>
    <ds-radio
      v-model="filter"
      buttons
      label="Filter"
      label-prop="text"
      @input="handleInput"
      :options="options"
    />
  </ds-card>
</template>

<script>
export default {
  data() {
    // We have to fix styleguide here. It uses .includes wich will always be
    // false for arrays of objects.
    return {
      filter: { value: 'all', text: this.$t('filter-menu.options.all') },
    }
  },
  computed: {
    options() {
      return [
        { value: 'friends', text: this.$t('filter-menu.options.friends') },
        { value: 'friends-of-a-friend', text: this.$t('filter-menu.options.friends-of-a-friend') },
        { value: 'all', text: this.$t('filter-menu.options.all') },
      ]
    },
  },
  methods: {
    handleInput(e) {
      // console.log('handleInput', e)
    },
  },
}
</script>
