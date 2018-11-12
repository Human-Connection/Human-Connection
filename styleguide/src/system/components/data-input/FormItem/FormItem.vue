<template>
  <div 
    class="ds-form-item"
    :class="$parentInput.stateClasses">
    <ds-input-label 
      :label="$parentInput.label" 
      :for="$parentInput.id" />
    <slot/>
    <ds-input-error :error="$parentInput.error" />
  </div>
</template>

<script>
/**
 * @version 1.0.0
 * @private
 */
export default {
  name: 'DsFormItem',
  inject: ['$parentInput']
}
</script>

<style lang="scss">
@import 'style';
</style>
