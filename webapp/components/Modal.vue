<template>
  <div class="modal-wrapper">
    <!-- Todo: Put all modals with 2 buttons and equal properties in one customiced 'danger-action-modal' -->
    <disable-modal
      v-if="open === 'disable'"
      :id="data.resource.id"
      :type="data.type"
      :name="name"
      @close="close"
    />
    <release-modal
      v-if="open === 'release'"
      :id="data.resource.id"
      :type="data.type"
      :name="name"
      @close="close"
    />
    <report-modal
      v-if="open === 'report'"
      :id="data.resource.id"
      :type="data.type"
      :name="name"
      @close="close"
    />
    <confirm-modal
      v-if="open === 'delete'"
      :id="data.resource.id"
      :type="data.type"
      :name="name"
      :modalData="data.modalsData.delete"
      @close="close"
    />
  </div>
</template>

<script>
import ConfirmModal from '~/components/Modal/ConfirmModal'
import DisableModal from '~/components/Modal/DisableModal'
import ReleaseModal from '~/components/ReleaseModal/ReleaseModal.vue'
import ReportModal from '~/components/Modal/ReportModal'
import { mapGetters } from 'vuex'

export default {
  name: 'Modal',
  components: {
    DisableModal,
    ReleaseModal,
    ReportModal,
    ConfirmModal,
  },
  computed: {
    ...mapGetters({
      data: 'modal/data',
      open: 'modal/open',
    }),
    name() {
      if (!this.data || !this.data.resource) return ''
      const {
        resource: { name, title, author },
      } = this.data
      switch (this.data.type) {
        case 'user':
          return name
        case 'contribution': // REFACTORING: In ConfirmModal – Already replaced  "title" by "this.menuModalsData.delete.messageParams".
          return title
        case 'comment':
          return author && author.name
        default:
          return null
      }
    },
  },
  methods: {
    close() {
      this.$store.commit('modal/SET_OPEN', {})
    },
  },
}
</script>
