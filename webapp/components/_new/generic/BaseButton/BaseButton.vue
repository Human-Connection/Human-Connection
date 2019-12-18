<template>
  <button :type="type" :class="buttonClass" :disabled="loading" @click="$emit('click')">
    <loading-spinner v-if="loading" />
    <base-icon v-if="icon" :name="icon" />
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
    icon: {
      type: String,
    },
    primary: {
      type: Boolean,
      default: false,
    },
    danger: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'regular',
      validator(value) {
        return value.match(/(small|regular|large)/)
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
      if (this.loading) buttonClass += ' --loading'

      if (this.primary) buttonClass += ' --primary'
      else if (this.danger) buttonClass += ' --danger'

      if (this.size === 'small') buttonClass += ' --small'
      else if (this.size === 'large') buttonClass += ' --large'

      return buttonClass
    }
  }
}
</script>

<style lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 12px;
  vertical-align: bottom;
  color: $color-primary;
  background-color: transparent;
  border: 1px solid $color-primary;
  border-radius: 6px;
  overflow: hidden;
  font-weight: $font-weight-bold;
  cursor: pointer;
  transition: background-color .1s;

  &:focus {
    outline: 1px dashed $color-primary;
  }

  &:hover {
    color: $color-neutral-100;
    background-color: $color-primary;
  }

  &:active {
    color: $color-neutral-100;
    border-color: $color-primary-dark;
    background-color: $color-primary-dark;
  }

  &:disabled {
    color: $color-neutral-60;
    border-color: $color-neutral-60;
    background-color: transparent;
    cursor: default;
  }

  &.--primary {
    color: $color-neutral-100;
    background-color: $color-primary;

    &:hover {
      background-color: $color-primary-light;
      border-color: $color-primary-light;
    }

    &:active {
      background-color: $color-primary-dark;
      border-color: $color-primary-dark;
    }

    &:disabled {
      background-color: $color-neutral-60;
      border-color: $color-neutral-60;
    }
  }

  &.--danger {
    color: $color-neutral-100;
    background-color: $color-danger;
    border-color: $color-danger;

    &:hover {
      background-color: $color-danger-light;
      border-color: $color-danger-light;
    }

    &:active {
      background-color: $color-danger-dark;
      border-color: $color-danger-dark;
    }

    &:disabled {
      background-color: $color-neutral-60;
      border-color: $color-neutral-60;
    }
  }

  &.--small {
    height: 26px;
    font-size: $font-size-small;

    &.--circle {
      width: 26px;
    }
  }

  &.--large {

  }

  &.--circle {
    width: 36px;
    border-radius: 50%;
  }

  &:not(.--icon-only) > .base-icon {
    margin-right: 6px;
  }

  > .loading-spinner {
    position: absolute;
    height: 26px;
    color: $color-neutral-60;
  }

  &.--loading {
    color: $color-neutral-80;

    &.--primary > .loading-spinner,
    &.--danger > .loading-spinner {
      color: $color-neutral-100;
    }
  }
}
</style>
