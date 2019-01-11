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
    <p>Are you sure that you want to report the {{ data.context }} "<b>{{ data.name | truncate(30) }}</b>"?</p>
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

export default {
  data() {
    return {
      loading: false,
      disabled: false
    }
  },
  computed: {
    data() {
      return this.$store.getters['modal/data'] || {}
    },
    title() {
      return this.$t(`report.${this.data.context}.title`)
    },
    isOpen() {
      return this.$store.getters['modal/open'] === 'report'
    }
  },
  watch: {
    isOpen(open) {
      if (open) {
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
      console.log('')
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $type: _ResourceType!, $description: String) {
              report(
                resource: { id: $id, type: $type }
                description: $description
              ) {
                id
              }
            }
          `,
          variables: {
            id: this.data.id,
            type: this.data.context,
            description: '-'
          }
        })
        .then(() => {
          this.isOpen = false
          this.$toast.success(err.message)
          this.disabled = true
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
