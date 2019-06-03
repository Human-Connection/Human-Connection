<template>
  <ds-modal :title="title"
:is-open="isOpen" @cancel="cancel">
    <transition name="ds-transition-fade">
      <ds-flex v-if="success"
class="hc-modal-success" centered>
        <sweetalert-icon icon="success" />
      </ds-flex>
    </transition>

    <!-- eslint-disable-next-line vue/no-v-html -->
    <p v-html="message" />

    <template slot="footer">
      <ds-button class="cancel"
icon="close" @click="cancel">
        {{ $t('post.delete.cancel') }}
      </ds-button>

      <ds-button danger
class="confirm" icon="trash" :loading="loading" @click="confirm">
        {{ $t('post.delete.submit') }}
      </ds-button>
    </template>
  </ds-modal>
</template>

<script>
import gql from 'graphql-tag'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  name: 'DeleteModal',
  components: {
    SweetalertIcon,
  },
  props: {
    name: { type: String, default: '' },
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
      return this.$t(`post.delete.title`)
    },
    message() {
      const name = this.$filters.truncate(this.name, 30)
      return this.$t(`post.delete.message`, { name })
    },
  },
  methods: {
    async cancel() {
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      this.loading = true
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation($id: ID!) {
              DeletePost(id: $id) {
                id
              }
            }
          `,
          variables: { id: this.id },
        })
        this.success = true
        this.$toast.success(this.$t('post.delete.success'))
        setTimeout(() => {
          this.isOpen = false
          setTimeout(() => {
            this.success = false
            this.$emit('close')
            if (this.$router.history.current.name === 'post-id-slug') {
              // redirect to index
              this.$router.history.push('/')
            } else {
              // reload the page (when deleting from profile or index)
              window.location.assign(window.location.href)
            }
          }, 500)
        }, 1500)
      } catch (err) {
        this.success = false
        this.$toast.error(err.message)
      } finally {
        this.loading = false
      }
    },
  },
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
