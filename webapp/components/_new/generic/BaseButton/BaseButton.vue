<template>
  <button :class="buttonClass" :disabled="loading">
    <ds-spinner v-if="loading" />
    <base-icon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<script>
export default {
  props: {
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
  },
  computed: {
    buttonClass() {
      let buttonClass = 'base-button'

      if (this.$slots.default == null) buttonClass += ' --icon-only'
      if (this.primary) buttonClass += ' --primary'
      else if (this.danger) buttonClass += ' --danger'

      return buttonClass
    }
  }
}
</script>

<style lang="scss">
.base-button {
  display: inline-flex;
  align-items: center;
  height: 36px;
  padding: 0 12px;
  color: $color-primary;
  background-color: $color-neutral-90;
  border: 1px solid $color-primary;
  border-radius: 6px;
  font-weight: $font-weight-bold;
  cursor: pointer;

  &:focus {
    outline: 1px dashed $color-primary;
    outline-offset: 2px;
  }

  &:hover {
    color: $color-neutral-100;
    background-color: $color-primary;
  }

  &:active {
    color: $color-neutral-100;
    background-color: $color-primary-active;
  }

  &:disabled {
    color: $color-neutral-60;
    border-color: $color-neutral-60;
    background-color: $color-neutral-90;
    cursor: default;
  }

  &.--primary {
    border: none;
    color: $color-neutral-100;
    background-color: $color-primary;

    &:hover {
      background-color: $color-primary-active;
    }
  }

  &.--danger {
    border: none;
    color: $color-neutral-100;
    background-color: $color-danger;

    &:hover {
      background-color: $color-danger-active;
    }
  }

  &:not(.--icon-only) > .base-icon {
    margin-right: 6px;
  }
}
</style>
