<template>
  <div>
    <portal-target
      id="portal"
      name="modal"
    />
    <report-modal />
  </div>
</template>

<script>
import ReportModal from './ReportModal.vue'

export default {
  components: {
    ReportModal
  }
}
</script>
