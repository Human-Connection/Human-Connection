<template>
  <div class="modal-wrapper">
    <disable-modal
      v-if="open === 'disable'"
      :resource="data"
      @close="close"
    />
    <report-modal
      v-if="open === 'report'"
      :resource="data"
      @close="close"
    />
  </div>
</template>

<script>
import DisableModal from '~/components/Modal/DisableModal'
import ReportModal from '~/components/Modal/ReportModal'
import { mapGetters } from 'vuex'

export default {
  name: 'Modal',
  components: {
    DisableModal,
    ReportModal
  },
  computed: {
    ...mapGetters({
      data: 'modal/data',
      open: 'modal/open'
    })
  },
  methods: {
    close() {
      this.$store.commit('modal/SET_OPEN', {})
    }
  }
}
</script>
