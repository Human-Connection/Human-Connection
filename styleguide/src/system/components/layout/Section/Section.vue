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
     */
    fullheight: {
      type: Boolean,
      default: false
    },
    /**
     * Highlight with primary color
     */
    primary: {
      type: Boolean,
      default: false
    },
    /**
     * Highlight with secondary color
     */
    secondary: {
      type: Boolean,
      default: false
    },
    /**
     * Center the content
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
