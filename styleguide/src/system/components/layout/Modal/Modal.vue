<template>
  <portal to="modal">
    <div :key="key" class="ds-modal-wrapper">
      <transition name="ds-transition-fade" appear>
        <div
          v-if="isOpen"
          class="ds-modal-backdrop"
          ref="backdrop"
          @click="backdropHandler"
        >
          &nbsp;
        </div>
      </transition>
      <transition name="ds-transition-modal-appear" appear>
        <div
          v-if="isOpen"
          class="ds-modal"
          tableindex="-1"
          role="dialog"
          ref="modal"
          style="display: block"
        >
          <div class="ds-modal-dialog">
            <div class="ds-modal-content">
              <div class="ds-modal-header">
                <ds-heading
                  tag="h3"
                  class="ds-modal-title"
                >
                  {{ title }}
                </ds-heading>
                <ds-button
                  v-if="allowAbort"
                  class="ds-modal-close"
                  ghost
                  size="small"
                  icon="close"
                  aria-hidden="true"
                  @click="cancel('close')"
                />
              </div>
              <div
                class="ds-modal-body"
                ref="modalBody"
              >
                <!-- @slot Modal content -->
                <slot/>
              </div>
              <div class="ds-modal-footer">
                <!-- @slot Modal footer with action buttons -->
                <slot
                  name="footer"
                  :confirm="confirm"
                  :cancel="cancel"
                  :cancelLabel="cancelLabel"
                  :confirmLabel="confirmLabel"
                >
                  <ds-button ghost icon="close" @click.prevent="cancel('cancel')">{{ cancelLabel }}</ds-button>
                  <ds-button primary icon="check" @click.prevent="confirm('confirm')">{{ confirmLabel }}</ds-button>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </portal>
</template>

<script>
import Vue from 'vue'
import portal from 'portal-vue'
Vue.use(portal)

/* eslint-disable no-empty */

/**
 * Simple Modal Component
 * @version 1.0.0
 */
export default {
  name: 'DsModal',
  props: {
    /**
     * Modal title
     */
    title: {
      type: String,
      default: null
    },
    /**
     * Open state
     */
    isOpen: {
      type: Boolean,
      default: false
    },
    /**
     * Allow closing without choosing action by ESC key, close button or click on the backdrop
     */
    allowAbort: {
      type: Boolean,
      default: true
    },
    /**
     * Cancel button label
     */
    cancelLabel: {
      type: String,
      default: 'Cancel'
    },
    /**
     * Confirm button label
     */
    confirmLabel: {
      type: String,
      default: 'Confirm'
    }
  },
  model: {
    prop: 'isOpen',
    event: 'update:isOpen'
  },
  watch: {
    isOpen: {
      immediate: true,
      handler(show) {
        try {
          if (show) {
            this.$emit('opened')
            document
              .getElementsByTagName('body')[0]
              .classList
              .add('modal-open')
          } else {
            document
              .getElementsByTagName('body')[0]
              .classList
              .remove('modal-open')
          }
        } catch (err) {}
      }
    }
  },
  methods: {
    confirm (type = 'confirm') {
      this.$emit('confirm')
      this.close(type)
    },
    cancel (type = 'cancel') {
      this.$emit('cancel')
      this.close(type)
    },
    close (type) {
      this.$emit('update:isOpen', false)
      this.$emit('close', type)
    },
    backdropHandler () {
      if (this.allowAbort) {
        this.cancel('backdrop')
      }
    }
  },
  beforeCreate() {
    // create random key string
    this.key = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, '')
      .substr(0, 5)
  },
  mounted() {
    const keydownListener = document.addEventListener('keydown', e => {
      if (this.isOpen && this.allowAbort && e.keyCode === 27) {
        this.cancel('backdrop')
      }
    })
    this.$once('hook:beforeDestroy', () => {
      document.removeEventListener('keydown', keydownListener)
    })

    if (this.isOpen) {
      this.$emit('opened')
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
