<template>
  <ds-form-item>
    <div class="ds-input-wrap">
      <div
        v-if="icon"
        class="ds-input-icon">
        <ds-icon :name="icon"/>
      </div>
      <component
        class="ds-input"
        :class="[
          icon && `ds-input-has-icon`,
          iconRight && `ds-input-has-icon-right`
        ]"
        :id="id"
        :name="model"
        :type="type"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :tabindex="tabindex"
        :disabled="disabled"
        :readonly="readonly"
        :is="tag"
        :value.prop="innerValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        :rows="type === 'textarea' ? rows : null"
        v-html="type === 'textarea' ? innerValue : null"/>
      <div
        v-if="iconRight"
        class="ds-input-icon-right">
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
  name: 'DsInput',
  mixins: [inputMixin],
  props: {
    /**
     * The type of this input `url, text, password, email, search, textarea`.
     */
    type: {
      type: String,
      default: 'text',
      validator: value => {
        return value.match(/(url|text|password|email|search|textarea)/)
      }
    },
    /**
     * The placeholder shown when value is empty.
     */
    placeholder: {
      type: String,
      default: null
    },
    /**
     * The name of the field for better accessibility
     */
    name: {
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
     * How many rows this input should have (only for type="textarea")
     */
    rows: {
      type: [String, Number],
      default: 1
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
    }
  },
  computed: {
    tag() {
      if (this.type === 'textarea') {
        return 'textarea'
      }
      return 'input'
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
