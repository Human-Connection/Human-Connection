<template>
  <ds-modal
    :title="title"
    :is-open="isOpen"
    @cancel="$emit('close')"
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
        @click="$emit('close')"
      >
        {{ $t('report.cancel') }}
      </ds-button>

      <ds-button
        danger
        class="confirm"
        icon="exclamation-circle"
        :loading="loading"
        @click="confirm"
      >
        {{ $t('report.submit') }}
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
  data() {
    return {
      success: false,
      loading: false
    }
  },
  computed: {
    title() {
      return this.$t(`report.${this.resource.type}.title`)
    },
    message() {
      const name = this.$filters.truncate(this.resource.name, 30)
      return this.$t(`report.${this.resource.type}.message`, { name })
    }
  },
  methods: {
    async confirm() {
      this.loading = true
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation($id: ID!) {
              report(id: $id) {
                id
              }
            }
          `,
          variables: { id: this.resource.id }
        })
        this.success = true
        this.$toast.success(this.$t('report.success'))
        setTimeout(() => {
          this.$emit('close')
        }, 1500)
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.loading = false
      }
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
