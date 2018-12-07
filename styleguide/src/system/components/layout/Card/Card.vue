<template>
  <component
    :is="tag"
    class="ds-card"
    :class="[
      $slots.image && 'ds-card-has-image',
      primary && `ds-card-primary`,
      secondary && `ds-card-secondary`,
      centered && `ds-card-centered`,
      hover && `ds-card-hover`
  ]">
    <div
      class="ds-card-image"
      v-if="image || $slots.image">
      <!-- @slot Content of the card's image -->
      <slot name="image">
        <img
          :src="image"
          v-if="!error"
          @error="onError" >
      </slot>
    </div>
    <div
      class="ds-card-icon"
      v-if="icon">
      <ds-icon :name="icon"/>
    </div>
    <header
      class="ds-card-header"
      v-if="header || $slots.header">
      <!-- @slot Content of the card's header -->
      <slot name="header">
        <ds-heading
          :tag="headerTag"
          size="h3">{{ header }}</ds-heading>
      </slot>
    </header>
    <div class="ds-card-content">
      <template v-if="space">
        <ds-space :margin="space">
          <slot />
        </ds-space>
      </template>
      <template v-else>
        <slot />
      </template>
    </div>
    <footer
      class="ds-card-footer"
      v-if="$slots.footer">
      <!-- @slot Content of the card's footer -->
      <slot name="footer"/>
    </footer>
  </component>
</template>

<script>
/**
 * A card is used to group content in an appealing way.
 * @version 1.0.0
 */
export default {
  name: 'DsCard',
  props: {
    /**
     * The html element name used for the card.
     */
    tag: {
      type: String,
      default: 'article'
    },
    /**
     * The header for the card.
     */
    header: {
      type: String,
      default: null
    },
    /**
     * The heading type used for the header.
     * `h1, h2, h3, h4, h5, h6`
     */
    headerTag: {
      type: String,
      default: 'h3',
      validator: value => {
        return value.match(/(h1|h2|h3|h4|h5|h6)/)
      }
    },
    /**
     * The image for the card.
     */
    image: {
      type: String,
      default: null
    },
    /**
     * The icon for the card.
     */
    icon: {
      type: String,
      default: null
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
     * Make the card hoverable
     * `true, false`
     */
    hover: {
      type: Boolean,
      default: false
    },
    /**
     * If you need some spacing you can provide it here like for ds-space
     * `xxx-small, xx-small, x-small, small, large, x-large, xx-large, xxx-large`
     */
    space: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      error: false
    }
  },
  methods: {
    onError() {
      this.error = true
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
