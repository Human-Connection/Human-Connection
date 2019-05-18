<template>
  <div class="modal-wrapper">
    <disable-modal
      v-if="open === 'disable'"
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
    <delete-modal
      v-if="open === 'delete'"
      :id="data.resource.id"
      :type="data.type"
      :deleteCallback="deleteCallback"
      :name="name"
      @close="close"
    />
  </div>
</template>

<script>
import DisableModal from '~/components/Modal/DisableModal'
import ReportModal from '~/components/Modal/ReportModal'
import DeleteModal from '~/components/Modal/DeleteModal'
import { mapGetters } from 'vuex'

export default {
  name: 'Modal',
  components: {
    DisableModal,
    ReportModal,
    DeleteModal
  },
  props: {
    deleteCallback: { type: Function, required: true },
    cancelCallback: { type: Function, default: null }
  },
  computed: {
    ...mapGetters({
      data: 'modal/data',
      open: 'modal/open'
    }),
    name() {
      if (!this.data || !this.data.resource) return ''
      const {
        resource: { name, title, author }
      } = this.data
      switch (this.data.type) {
        case 'user':
          return name
        case 'contribution':
          return title
        case 'comment':
          return author && author.name
        default:
          return null
      }
    }
  },
  methods: {
    close() {
      this.$store.commit('modal/SET_OPEN', {})
    }
  }
}
</script>
