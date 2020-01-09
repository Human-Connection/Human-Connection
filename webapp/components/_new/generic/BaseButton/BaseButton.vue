<template>
  <button
    :class="buttonClass"
    :disabled="loading"
    :type="type"
    @click.capture="event => $emit('click', event)"
  >
    <base-icon v-if="icon" :name="icon" />
    <loading-spinner v-if="loading" />
    <slot />
  </button>
</template>

<script>
import LoadingSpinner from '~/components/_new/generic/LoadingSpinner/LoadingSpinner'

export default {
  components: {
    LoadingSpinner,
  },
  props: {
    circle: {
      type: Boolean,
      default: false,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    ghost: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'regular',
      validator(value) {
        return value.match(/(small|regular)/)
      },
    },
    type: {
      type: String,
      default: 'button',
      validator(value) {
        return value.match(/(button|submit)/)
      },
    },
  },
  computed: {
    buttonClass() {
      let buttonClass = 'base-button'

      if (this.$slots.default == null) buttonClass += ' --icon-only'
      if (this.circle) buttonClass += ' --circle'
      if (this.danger) buttonClass += ' --danger'
      if (this.loading) buttonClass += ' --loading'
      if (this.size === 'small') buttonClass += ' --small'

      if (this.filled) buttonClass += ' --filled'
      else if (this.ghost) buttonClass += ' --ghost'

      return buttonClass
    },
  },
}
</script>

<style lang="scss">
@import '~/assets/_new/styles/mixins/buttonStates.scss';

.base-button {
  @include buttonStates;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 12px;
  vertical-align: bottom;
  border: 1px solid;
  border-radius: 6px;
  overflow: hidden;
  font-weight: $font-weight-bold;
  cursor: pointer;

  &.--danger {
    @include buttonStates($color-scheme: danger);
  }

  &.--filled {
    @include buttonStates($filled: true);
  }

  &.--danger.--filled {
    @include buttonStates($color-scheme: danger, $filled: true)
  }

  &.--circle {
    width: 36px;
    border-radius: 50%;
  }

  &.--ghost {
    border: none;
  }

  &.--small {
    height: 26px;
    font-size: $font-size-small;

    &.--circle {
      width: 26px;
    }
  }

  &:not(.--icon-only) > .base-icon {
    margin-right: 6px;
  }

  > .loading-spinner {
    position: absolute;
    height: 26px;
    color: $color-neutral-60;
  }

  &.--filled > .loading-spinner {
    color: $color-neutral-100;
  }
}
</style>
