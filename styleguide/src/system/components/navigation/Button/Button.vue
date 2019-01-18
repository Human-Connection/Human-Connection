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
      fullwidth && `ds-button-fullwidth`,
      loading && `ds-button-loading`,
      right && `ds-button-right`
    ]"
    :name="name"
    v-bind="bindings"
    :is="linkTag">
    <div class="ds-button-wrap">
      <ds-icon
        v-if="icon"
        :name="icon" 
      />
      <span
        class="ds-button-text"
        v-if="$slots.default">
        <slot />
      </span>
    </div>
    <ds-spinner
      v-if="loading" 
      :inverse="!ghost && (primary || secondary || danger)"
    />
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
     * @options small|base|large
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
     * @options router-link|a|button
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
     * Button name for accessibilty
     */
    name: {
      type: String,
      default: null
    },
    /**
     * Primary style
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Secondary style
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Danger style
     */
    danger: {
      type: Boolean,
      default: false
    },
    /**
     * Toggle the hover state
     */
    hover: {
      type: Boolean,
      default: false
    },
    /**
     * Make the buttons background transparent
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
     * Put the icon to the right.
     */
    right: {
      type: Boolean,
      default: false
    },
    /**
     * Should the button spread to the full with of the parent?
     */
    fullwidth: {
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
      return !this.$slots.default && this.icon
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
