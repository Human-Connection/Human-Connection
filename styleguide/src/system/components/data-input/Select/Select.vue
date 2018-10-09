<template>
  <ds-form-item>
    <div class="ds-select-wrap">
      <div
        v-if="icon"
        class="ds-select-icon">
        <ds-icon :name="icon"/>
      </div>
      <select
        class="ds-select"
        :class="[
          icon && `ds-select-has-icon`,
          iconRight && `ds-select-has-icon-right`
        ]"
        :id="id"
        :name="model"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value.prop="innerValue"
        @input="input"
        @focus="handleFocus"
        @blur="handleBlur">
        <option
          v-for="option in options"
          :key="option.label || option">
          {{ option.label || option }}
        </option>
      </select>
      <div
        v-if="iconRight"
        class="ds-select-icon-right">
        <ds-icon :name="iconRight"/>
      </div>
    </div>
  </ds-form-item>
</template>

<script>
import inputMixin from '../shared/input'

/**
 * Used for handling basic user input.
 * @version 1.0.0
 */
export default {
  name: 'DsSelect',
  mixins: [inputMixin],
  props: {
    /**
     * The placeholder shown when value is empty.
     */
    placeholder: {
      type: String,
      default: null
    },
    /**
     * Whether the input should be automatically focused
     */
    autofocus: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the input should be read-only
     */
    readonly: {
      type: Boolean,
      default: false
    },
    /**
     * Whether the user can select multiple items
     */
    multiple: {
      type: Boolean,
      default: false
    },
    /**
     * The name of the input's icon.
     */
    icon: {
      type: String,
      default: null
    },
    /**
     * The name of the input's right icon.
     */
    iconRight: {
      type: String,
      default: null
    },
    /**
     * The select options.
     */
    options: {
      type: Array,
      default() {
        return []
      }
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
