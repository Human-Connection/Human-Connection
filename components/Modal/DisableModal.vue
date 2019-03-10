<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
  >
    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <template slot="footer">
      <ds-button
        class="cancel"
        @click="$emit('close')"
      >
        {{ $t('disable.cancel') }}
      </ds-button>

      <ds-button
        class="confirm"
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
    isOpen: {
      type: Boolean,
      default: false
    },
    resource: {
      type: Object,
      default() {
        return { id: null, type: 'contribution', name: '' }
      }
    }
  },
  computed: {
    title() {
      return this.$t(`disable.${this.resource.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.resource.name, 30)
      return this.$t(`disable.${this.resource.type}.message`, { name })
    }
  },
  methods: {
    async confirm() {
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation($id: ID!) {
              disable(id: $id)
            }
          `,
          variables: { id: this.resource.id }
        })
        this.$toast.success(this.$t('disable.success'))
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.$emit('close')
      }
    }
  }
}
</script>
