<template>
  <ds-modal :is-open="isOpen">
    <template slot="footer">
      <ds-button
        class="cancel"
        @click.prevent="$emit('close')"
      >
        Cancel
      </ds-button>

      <ds-button
        class="confirm"
        @click="confirm"
      >
        Confirm
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
    id: {
      type: Number,
      default: null
    }
  },
  methods: {
    async confirm() {
      await this.$apollo.mutate({
        mutation: gql`
          mutation($id: ID!) {
            disable(id: $id)
          }
        `,
        variables: { id: this.id }
      })
      this.$emit('close')
    }
  }
}
</script>
