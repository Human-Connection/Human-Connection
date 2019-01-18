<template>
  <ds-form-item>
    <div
      class="ds-radio"
      :tabindex="tabindex"
      @keydown.self.down.prevent="pointerNext"
      @keydown.self.up.prevent="pointerPrev">
      <component
        class="ds-radio-option"
        :class="[
          isSelected(option) && `ds-radio-option-is-selected`
        ]"
        v-for="option in options"
        @click="handleSelect(option)"
        :key="option[labelProp] || option"
        :is="buttons ? 'ds-button' : 'div'"
        :primary="buttons && isSelected(option)">
        <span 
          class="ds-radio-option-mark" 
          v-if="!buttons"/>
        <span class="ds-radio-option-label">
          <!-- @slot Slot to provide custom option items -->
          <slot
            name="option"
            :option="option">
            {{ option[labelProp] || option }}
          </slot>
        </span>
      </component>
    </div>
  </ds-form-item>
</template>

<script>
import inputMixin from '../shared/input'
import multiinputMixin from '../shared/multiinput'
import DsFormItem from '@@/components/data-input/FormItem/FormItem'

/**
 * Used for letting the user choose one value from a set of options.
 * @version 1.0.0
 */
export default {
  name: 'DsRadio',
  mixins: [inputMixin, multiinputMixin],
  components: {
    DsFormItem
  },
  data() {
    return {
      pointer: 0
    }
  },
  props: {
    /**
     * Whether the input should be options should be buttons
     */
    buttons: {
      type: Boolean,
      default: false
    },
    /**
     * The select options.
     */
    options: {
      type: Array,
      default() {
        return []
      }
    },
    /**
     * The prop to use as the label when options are objects
     */
    labelProp: {
      type: String,
      default: 'label'
    }
  },
  computed: {
    pointerMax() {
      return this.options.length - 1
    }
  },
  watch: {
    pointerMax(max) {
      if (max < this.pointer) {
        this.$nextTick(() => {
          this.pointer = max
        })
      }
    }
  },
  methods: {
    handleSelect(option) {
      this.selectOption(option)
    },
    pointerPrev() {
      if (this.pointer === 0) {
        this.pointer = this.pointerMax
      } else {
        this.pointer--
      }
      this.selectPointerOption()
    },
    pointerNext() {
      if (this.pointer === this.pointerMax) {
        this.pointer = 0
      } else {
        this.pointer++
      }
      this.selectPointerOption()
    },
    selectPointerOption() {
      this.handleSelect(this.options[this.pointer])
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
