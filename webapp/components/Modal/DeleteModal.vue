<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    @cancel="cancel"
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
    >
      <ds-button
        class="cancel"
        icon="close"
        @click="cancel"
      >
        {{ $t(`delete.cancel`) }}
      </ds-button>

      <ds-button
        danger
        class="confirm"
        icon="trash"
        :loading="loading"
        @click="confirm"
      >
        {{ $t(`delete.submit`) }}
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
    callbacks: { type: Object, required: true },
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
      return this.$t(`delete.${this.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.name, 30)
      return this.$t(`delete.${this.type}.message`, { name })
    },
  },
  methods: {
    async cancel() {
      if (this.callbacks.cancel) {
        await this.callbacks.cancel()
      }
      this.isOpen = false
      setTimeout(() => {
        this.$emit('close')
      }, 1000)
    },
    async confirm() {
      this.loading = true
      try {
        if (this.callbacks.confirm) {
          await this.callbacks.confirm()
        }
        this.success = true
        setTimeout(() => {
          this.isOpen = false
          setTimeout(() => {
            this.success = false
            this.$emit('close')
          }, 500)
        }, 1500)
      } catch (err) {
        this.success = false
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
