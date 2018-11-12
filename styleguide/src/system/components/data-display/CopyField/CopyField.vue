<template>
  <component 
    :is="tag"
    class="ds-copy-field"
    :class="`ds-copy-field-${size}`">
    <div ref="text">
      <slot />
    </div>
    <div
      class="ds-copy-field-link">
      <ds-button
        @click="copy"
        icon="copy"
        color="soft"
        ghost/>
    </div>
    <transition name="ds-copy-field-message">
      <div
        v-show="showMessage"
        class="ds-copy-field-message">
        <div 
          class="ds-copy-field-message-text"
          ref="messageText"/>
      </div>
    </transition>
  </component>
</template>

<script>
import DsButton from '@@/components/navigation/Button/Button'
/**
 * A copy field is used to present text that can easily
 * be copied to the users clipboard by clicking on it.
 * @version 1.0.0
 */
export default {
  name: 'DsCopyField',
  components: {
    'ds-button': DsButton
  },
  props: {
    /**
     * The size used for the text.
     * `small, base, large`
     */
    size: {
      type: String,
      default: 'base',
      validator: value => {
        return value.match(/(small|base|large)/)
      }
    },
    /**
     * The html element name used for the copy field.
     */
    tag: {
      type: String,
      default: 'div'
    }
  },
  data() {
    return {
      showMessage: false
    }
  },
  methods: {
    copy() {
      const content = this.$refs.text.innerText
      this.$refs.messageText.innerText = content
      this.$copyToClipboard(content)
      this.showMessage = true
      this.$nextTick(() => {
        this.showMessage = false
      })
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
