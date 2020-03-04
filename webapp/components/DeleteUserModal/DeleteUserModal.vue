<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <!-- <p v-html="message" /> -->
    <delete-data />
    <template slot="footer">
      <base-button class="cancel" @click="cancel">{{ $t('actions.cancel') }}</base-button>
      <base-button danger filled class="confirm" icon="exclamation-circle" @click="confirm">
        {{ $t('settings.deleteUserAccount.name') }}
      </base-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'
import DeleteData from '~/components/DeleteData/DeleteData.vue'

export default {
  components: {
    DeleteData,
  },
  props: {
    slug: { type: String, required: true },
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false,
      isAdmin: this.$store.getters['auth/isAdmin'],
    }
  },
  computed: {
    title() {
      return this.$props.name + ' (' + this.$props.slug + ')'
    },
  },
  methods: {
    cancel() {
      // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
      // await this.modalData.buttons.cancel.callback()
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      try {
        // TODO: Use the "modalData" structure introduced in "ConfirmModal" and refactor this here. Be aware that all the Jest tests have to be refactored as well !!!
        // await this.modalData.buttons.confirm.callback()
        this.$apollo
          .mutate({
            mutation: gql`
              mutation($id: ID!, $resource: [Deletable]) {
                DeleteUser(id: $id, resource: $resource) {
                  id
                }
              }
            `,
            variables: { id: this.$props.id, resource: ['Post', 'Comment'] },
          })
          .then(() => {
            this.$toast.success(this.$t('settings.deleteUserAccount.success'))
            this.$router.history.push('/')
          })
          .catch(error => {
            this.$toast.error(error.message)
          })
        this.isOpen = false
      } catch (err) {
        this.$toast.error(err.message)
        this.isOpen = false
      }
    },
  },
}
</script>
