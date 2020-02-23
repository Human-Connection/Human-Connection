<template>
  <ds-modal :title="title" :is-open="isOpen" @cancel="cancel">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <!-- <p v-html="message" /> -->
    <delete-data />
    <template slot="footer">
      <base-button class="cancel" @click="cancel">löschen abbrechen</base-button>
      <base-button danger filled class="confirm" icon="exclamation-circle" @click="confirm">
        User jetzt Löschen!
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
    name: { type: String, default: 'jetzt löschen' },
    type: { type: String, required: true },
    id: { type: String, required: true },
  },
  data() {
    return {
      isOpen: true,
      success: false,
      loading: false,
    }
  },
  computed: {
    title() {
      return 'User Löschen'
      // return this.$t(`release.${this.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.name, 30)
      return name
      // return this.$t(`release.${this.type}.message`, { name })
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
        await this.$apollo.mutate({
          /* mutation: gql`
            mutation($resourceId: ID!, $disable: Boolean, $closed: Boolean) {
              review(resourceId: $resourceId, disable: $disable, closed: $closed) {
                disable
              }
            }
          `, */
          mutation: gql`
            mutation {
              DeleteUser(id: "u3", resource: [Post, Comment]) {
                id
                name
                slug
                about
                deleted
                contributions {
                  id
                  content
                  contentExcerpt
                  deleted
                  comments {
                    id
                    content
                    contentExcerpt
                    deleted
                  }
                }
                comments {
                  id
                  content
                  contentExcerpt
                  deleted
                }
              }
            }
          `,
          variables: { resourceId: this.id, disable: false, closed: false },
        })
        this.$toast.success('user gelöscht')
        this.isOpen = false
        setTimeout(() => {
          this.$emit('close')
        }, 1000)
      } catch (err) {
        this.$toast.error(err.message)
        this.isOpen = false
      }
    },
  },
}
</script>
