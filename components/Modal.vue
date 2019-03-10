<template>
  <div class="modal-wrapper">
    <disable-modal
      v-if="open === 'disable'"
      :is-open="open === 'disable'"
      :resource="data"
      @close="close"
    />
  </div>
</template>

<script>
import DisableModal from '~/components/Modal/DisableModal'
import { mapGetters } from 'vuex'

export default {
  name: 'Modal',
  components: {
    DisableModal
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
