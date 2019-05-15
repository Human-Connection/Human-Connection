<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    @cancel="cancel"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <template slot="footer">
      <ds-button
        class="cancel"
        @click="cancel"
      >
        {{ $t('disable.cancel') }}
      </ds-button>

      <ds-button
        danger
        class="confirm"
        icon="exclamation-circle"
        @click="confirm"
      >
        {{ $t('disable.submit') }}
      </ds-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'

export default {
  props: {
    name: { type: String, default: '' },
    type: { type: String, required: true },
    id: { type: String, required: true }
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false
    }
  },
  computed: {
    title() {
      return this.$t(`disable.${this.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.name, 30)
      return this.$t(`disable.${this.type}.message`, { name })
    }
  },
  methods: {
    cancel() {
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation($id: ID!) {
              disable(id: $id)
            }
          `,
          variables: { id: this.id }
        })
        this.$toast.success(this.$t('disable.success'))
        this.isOpen = false
        setTimeout(() => {
          this.$emit('close'),
           location.reload()
        }, 1500)
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
}
</script>
