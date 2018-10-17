<template>
  <component
    @click.capture="handleClick"
    class="ds-button"
    :class="[
      size && `ds-button-size-${size}`,
      primary && `ds-button-primary`,
      secondary && `ds-button-secondary`,
      danger && `ds-button-danger`,
      ghost && `ds-button-ghost`,
      iconOnly && `ds-button-icon-only`,
      hover && `ds-button-hover`,
      fullWidth && `ds-button-full-width`,
      loading && `ds-button-loading`
    ]"
    v-bind="bindings"
    :is="linkTag">
    <ds-icon
      v-if="loading"
      name="spinner" />
    <ds-icon
      v-if="icon && !loading"
      :name="icon"/>
    <span
      class="ds-button-text"
      v-if="$slots.default">
      <slot />
    </span>
    <ds-icon
      v-if="iconRight"
      :name="iconRight"/>
  </component>
</template>

<script>
/**
 * Used to provide actions or navigation.
 * @version 1.0.0
 */
export default {
  name: 'DsButton',
  props: {
    /**
     * The path of this button. Can be a url or a Vue router path object.
     */
    path: {
      type: [String, Object],
      default() {
        return null
      }
    },
    /**
     * The size used for the text.
     * `small, base, large`
     */
    size: {
      type: String,
      default: null,
      validator: value => {
        return value.match(/(small|base|large)/)
      }
    },
    /**
     * The component / tag used for this button
     * `router-link, a`
     */
    linkTag: {
      type: String,
      default() {
        const defaultLink = this.$router ? 'router-link' : 'a'
        return this.path ? defaultLink : 'button'
      },
      validator: value => {
        return value.match(/(router-link|a|button)/)
      }
    },
    /**
     * Primary style
     * `true, false`
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Secondary style
     * `true, false`
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Danger style
     * `true, false`
     */
    danger: {
      type: Boolean,
      default: false
    },
    /**
     * Toggle the hover state
     * `true, false`
     */
    hover: {
      type: Boolean,
      default: false
    },
    /**
     * Make the buttons background transparent
     * `true, false`
     */
    ghost: {
      type: Boolean,
      default: false
    },
    /**
     * The name of the buttons icon.
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * The name of the buttons right icon.
     */
    iconRight: {
      type: String,
      default: null
    },
    /**
     * Should the button spread to the full with of the parent?
     */
    fullWidth: {
      type: Boolean,
      default: false
    },
    /**
     * Show loading state
     */
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    bindings() {
      const bindings = {}
      if (this.path && this.linkTag === 'router-link') {
        bindings.to = this.path
      }
      if (this.path && this.linkTag === 'a') {
        bindings.href = this.path
      }
      if (this.loading) {
        bindings.disabled = true
      }
      return bindings
    },
    iconOnly() {
      return !this.$slots.default && this.icon && !this.iconRight
    }
  },
  methods: {
    handleClick(event) {
      /**
       * Click on button.
       * Receives two arguments:
       * event, route object
       *
       * @event click
       */
      this.$emit('click', event, this.route)
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
