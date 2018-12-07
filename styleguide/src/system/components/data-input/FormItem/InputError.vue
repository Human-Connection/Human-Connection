<template>
  <transition name="ds-input-error">
    <div
      class="ds-input-error"
      v-show="!!error">
      {{ error }}
    </div>
  </transition>
</template>

<script>
/**
 * @version 1.0.0
 * @private
 */
export default {
  name: 'DsInputError',
  props: {
    error: {
      type: String,
      required: false,
      default: null
    }
  }
}
</script>
