<template>
  <div class="modal-wrapper">
    <disable-modal
      v-if="showDisableModal"
      :is-open="showDisableModal"
    />
  </div>
</template>

<script>
import DisableModal from '~/components/Modal/DisableModal'

export default {
  name: 'Modal',
  components: {
    DisableModal
  },
  computed: {
    showDisableModal() {
      return this.$store.getters['modal/open'] === 'disable'
    }
  }
}
</script>
