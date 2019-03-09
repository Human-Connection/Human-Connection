<template>
  <report-modal v-if="showReportModal" />
</template>

<script>
import ReportModal from '~/components/ReportModal'

export default {
  name: 'Modal',
  components: {
    ReportModal
  },
  computed: {
    showReportModal() {
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
