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
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="$t(`report.${data.context}.message`, { name: name })" />
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
            mutation($id: ID!, $type: ResourceEnum!, $description: String) {
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
          this.$toast.success('Thanks for reporting!')
          this.disabled = true
          this.close()
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
