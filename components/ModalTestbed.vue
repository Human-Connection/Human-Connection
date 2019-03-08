<template>
  <div>
    <h1> Hello </h1>
    <portal-target name="modal" />
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
