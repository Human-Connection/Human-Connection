<template>
  <ds-form-item>
    <div
      class="ds-select-wrap"
      v-click-outside="handleBlur"
      :tabindex="searchable ? -1 : tabindex"
      @keydown.self.down.prevent="pointerNext"
      @keydown.self.up.prevent="pointerPrev"
      @keypress.enter.prevent.stop.self="selectPointerOption"
      @keyup.esc="close">
      <div
        v-if="icon"
        class="ds-select-icon">
        <ds-icon :name="icon"/>
      </div>
      <div
        class="ds-select"
        @click="handleClick"
        :class="[
          icon && `ds-select-has-icon`,
          iconRight && `ds-select-has-icon-right`,
          multiple && `ds-select-multiple`
      ]">
        <div
          v-if="multiple"
          class="ds-selected-options">
          <div
            class="ds-selected-option"
            v-for="(value, index) in innerValue"
            :key="value">
            <!-- @slot Slot to provide a custom selected option display -->
            <slot
              name="optionitem"
              :value="value">
              <ds-chip
                removable
                @remove="deselectOption(index)"
                color="primary">
                {{ value }}
              </ds-chip>
            </slot>
          </div>
          <input
            ref="search"
            class="ds-select-search"
            :id="id"
            :name="model"
            :autofocus="autofocus"
            :placeholder="placeholder"
            :tabindex="tabindex"
            :disabled="disabled"
            :readonly="readonly"
            v-model="searchString"
            @focus="handleFocus"
            @keydown.delete.stop="deselectLastOption"
            @keydown.down.prevent="pointerNext"
            @keydown.up.prevent="pointerPrev"
            @keypress.enter.prevent.stop="selectPointerOption"
            @keyup.esc="close">
        </div>
        <div
          v-else
          class="ds-select-value">
          <div
            v-if="placeholder && !innerValue"
            class="ds-select-placeholder">
            {{ placeholder }}
          </div>
          <!-- @slot Slot to provide a custom value display -->
          <slot
            v-else
            name="value"
            :value="innerValue">
            {{ innerValue }}
          </slot>
        </div>
        <input
          v-if="!multiple"
          ref="search"
          class="ds-select-search"
          :id="id"
          :name="model"
          :autofocus="autofocus"
          :placeholder="placeholder"
          :tabindex="tabindex"
          :disabled="disabled"
          :readonly="readonly"
          v-model="searchString"
          @focus="handleFocus"
          @keydown.delete.stop="deselectLastOption"
          @keydown.down.prevent="pointerNext"
          @keydown.up.prevent="pointerPrev"
          @keypress.enter.prevent.stop="selectPointerOption"
          @keyup.esc="close">
      </div>
      <div class="ds-select-dropdown">
        <ul class="ds-select-options">
          <li
            class="ds-select-option"
            :class="[
              isSelected(option) && `ds-select-option-is-selected`,
              pointer === index && `ds-select-option-hover`
            ]"
            v-for="(option, index) in filteredOptions"
            @click="handleSelect(option)"
            @mouseover="setPointer(index)"
            :key="option.label || option">
            <!-- @slot Slot to provide custom option items -->
            <slot
              name="option"
              :option="option">
              {{ option.label || option }}
            </slot>
          </li>
        </ul>
      </div>
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
import multiinputMixin from '../shared/multiinput'
import ClickOutside from 'vue-click-outside'
import DsFormItem from '@@/components/data-input/FormItem/FormItem'
import DsChip from '@@/components/typography/Chip/Chip'
import DsIcon from '@@/components/typography/Icon/Icon'

/**
 * Used for handling basic user input.
 * @version 1.0.0
 */
export default {
  name: 'DsSelect',
  mixins: [inputMixin, multiinputMixin],
  components: {
    DsFormItem,
    DsChip,
    DsIcon
  },
  directives: {
    ClickOutside
  },
  data() {
    return {
      searchString: '',
      pointer: 0
    }
  },
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
      default: 'angle-down'
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
     * Whether the options are searchable
     */
    searchable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    filteredOptions() {
      if (!this.searchString) {
        return this.options
      }
      const searchParts = this.searchString.split(' ')

      return this.options.filter(option => {
        const value = option.value || option
        return searchParts.every(part => {
          if (!part) {
            return true
          }
          return value.toLowerCase().includes(part.toLowerCase())
        })
      })
    },
    pointerMax() {
      return this.filteredOptions.length - 1
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
    handleSelect(options) {
      this.selectOption(options)
      this.resetSearch()
      if (this.multiple) {
        this.$refs.search.focus()
        this.handleFocus()
      } else {
        this.close()
      }
    },
    resetSearch() {
      this.searchString = ''
    },
    handleClick() {
      if (!this.focus || this.multiple) {
        this.$refs.search.focus()
        this.handleFocus()
      }
    },
    close() {
      this.$refs.search.blur()
      this.handleBlur()
    },
    deselectLastOption() {
      if (
        this.multiple &&
        this.innerValue &&
        this.innerValue.length &&
        !this.searchString.length
      ) {
        this.deselectOption(this.innerValue.length - 1)
      }
    },
    setPointer(index) {
      this.pointer = index
    },
    pointerPrev() {
      if (this.pointer === 0) {
        this.pointer = this.pointerMax
      } else {
        this.pointer--
      }
    },
    pointerNext() {
      if (this.pointer === this.pointerMax) {
        this.pointer = 0
      } else {
        this.pointer++
      }
    },
    selectPointerOption() {
      this.handleSelect(this.filteredOptions[this.pointer])
    }
  }
}
</script>

<style lang="scss" src="./style.scss">
</style>

<docs src="./demo.md"></docs>
