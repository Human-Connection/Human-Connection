<template>
  <component 
    :is="tag"
    class="ds-section"
    :class="[
      fullheight && `ds-section-fullheight`,
      primary && `ds-section-primary`,
      secondary && `ds-section-secondary`,
      centered && `ds-section-centered`
    ]"
  >
    <div class="ds-section-content">
      <ds-container>
        <slot />
      </ds-container>
    </div>
  </component>
</template>

<script>
/**
 * A section is used to group bigger chunks of related content.
 * @version 1.0.0
 */
export default {
  name: 'DsSection',
  props: {
    /**
     * Whether this section should be fullheight
     * `true, false`
     */
    fullheight: {
      type: Boolean,
      default: false
    },
    /**
     * Highlight with primary color
     * `true, false`
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Highlight with secondary color
     * `true, false`
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Center the content
     * `true, false`
     */
    centered: {
      type: Boolean,
      default: false
    },
    /**
     * The html element name used for the section.
     */
    tag: {
      type: String,
      default: 'section'
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
