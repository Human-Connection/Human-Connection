<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    cancel-label="Cancel"
    confirm-label="Send Report"
    @close="close"
  >
    <p>Are you sure that you want to report the {{ data.context }} "<b>{{ data.name | truncate(30) }}</b>"?</p>
  </ds-modal>
</template>

<script>
export default {
  computed: {
    data() {
      return this.$store.getters['modal/data'] || {}
    },
    title() {
      return `Report ${this.data.context}`
    },
    isOpen() {
      return this.$store.getters['modal/open'] === 'report'
    }
  },
  methods: {
    close() {
      this.$store.commit('modal/SET_OPEN', {})
    }
  }
}
</script>
