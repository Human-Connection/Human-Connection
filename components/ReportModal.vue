<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    :confirm-label="$t('report.submit')"
    :cancel-label="$t('report.cancel')"
    confrim-icon="warning"
    @confirm="report"
    @cancel="close"
  >
    <transition name="ds-transition-fade">
      <ds-flex
        v-if="success"
        class="hc-modal-success"
        centered
      >
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <template
      slot="footer"
      slot-scope="{ cancel, confirm, cancelLabel, confirmLabel }"
    >
      <ds-button
        ghost
        icon="close"
        :disabled="disabled || loading"
        @click.prevent="cancel('cancel')"
      >
        {{ cancelLabel }}
      </ds-button>
      <ds-button
        danger
        icon="exclamation-circle"
        :loading="loading"
        :disabled="disabled || loading"
        @click.prevent="confirm('confirm')"
      >
        {{ confirmLabel }}
      </ds-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  name: 'ReportModal',
  components: {
    SweetalertIcon
  },
  data() {
    return {
      success: false,
      loading: false,
      disabled: false
    }
  },
  computed: {
    data() {
      return this.$store.getters['modal/data'] || {}
    },
    title() {
      if (!this.data.context) return ''
      return this.$t(`report.${this.data.context}.title`)
    },
    message() {
      if (!this.data.context) return ''
      return this.$t(`report.${this.data.context}.message`, { name: this.name })
    },
    name() {
      return this.$filters.truncate(this.data.name, 30)
    },
    isOpen() {
      return this.$store.getters['modal/open'] === 'report'
    }
  },
  watch: {
    isOpen(open) {
      if (open) {
        this.success = false
        this.disabled = false
        this.loading = false
      }
    }
  },
  methods: {
    close() {
      this.$store.commit('modal/SET_OPEN', {})
    },
    report() {
      this.loading = true
      this.disabled = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $description: String) {
              report(id: $id, description: $description) {
                id
              }
            }
          `,
          variables: {
            id: this.data.id,
            description: '-'
          }
        })
        .then(() => {
          this.success = true
          this.$toast.success('Thanks for reporting!')
          setTimeout(this.close, 1500)
        })
        .catch(err => {
          this.$toast.error(err.message)
          this.disabled = false
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss">
.hc-modal-success {
  pointer-events: none;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #fff;
  opacity: 1;
  z-index: $z-index-modal;
  border-radius: $border-radius-x-large;
}
</style>
