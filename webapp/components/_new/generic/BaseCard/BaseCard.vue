<template>
  <article :class="classNames">
    <template v-if="$slots.imageColumn">
      <aside class="image-column">
        <slot name="imageColumn" />
      </aside>
      <section class="content-column">
        <slot />
      </section>
    </template>

    <template v-else-if="$slots.heroImage">
      <section class="hero-image">
        <slot name="heroImage" />
      </section>
      <slot />
    </template>

    <slot v-else />
    <aside v-if="$slots.topMenu" class="top-menu">
      <slot name="topMenu" />
    </aside>
  </article>
</template>

<script>
export default {
  props: {
    highlight: {
      type: Boolean,
      default: false,
    },
    wideContent: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classNames() {
      let classNames = 'base-card'

      if (this.$slots.imageColumn) classNames += ' --columns'
      if (this.highlight) classNames += ' --highlight'
      if (this.wideContent) classNames += ' --wide-content'

      return classNames
    },
  },
}
</script>

<style lang="scss">
.base-card {
  position: relative;
  padding: $space-base;
  border-radius: $border-radius-x-large;
  overflow: hidden;
  background-color: $color-neutral-100;
  box-shadow: $box-shadow-base;

  &.--columns {
    display: flex;
  }

  &.--highlight {
    border: $border-size-base solid $color-warning;
  }

  &.--wide-content {
    padding: $space-small;

    > .hero-image {
      width: calc(100% + (2 * #{$space-small}));
      margin: -$space-small;
      margin-bottom: $space-small;
    }
  }

  > .title,
  > .content-column > .title {
    font-size: $font-size-large;
    margin-bottom: $space-x-small;
  }

  > .hero-image {
    width: calc(100% + (2 * #{$space-base}));
    max-height: $size-image-max-height;
    margin: -$space-base;
    margin-bottom: $space-base;
    overflow: hidden;

    > .image {
      width: 100%;
      object-fit: contain;
    }
  }

  > .image-column {
    flex-basis: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-right: $space-base;

    .image {
      width: 100%;
      max-width: 200px;
    }
  }

  > .content-column {
    flex-basis: 50%;
  }

  > .top-menu {
    position: absolute;
    top: $space-small;
    left: $space-small;
  }
}

@media (max-width: 565px) {
  .base-card.--columns {
    flex-direction: column;

    > .image-column {
      padding-right: 0;
      margin-bottom: $space-base;
    }
  }
}
</style>
