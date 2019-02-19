<template>
  <ds-form-item>
    <div
      class="ds-select-wrap"
      :class="[
        isOpen && `ds-select-is-open`
      ]"
      :tabindex="searchable ? -1 : tabindex"
      v-click-outside="closeAndBlur"
      @keydown.tab="closeAndBlur"
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
        @click="openAndFocus"
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
            :key="value[labelProp] || value">
            <!-- @slot Slot to provide a custom selected option display -->
            <slot
              name="optionitem"
              :value="value">
              <ds-chip
                removable
                @remove="deselectOption(index)"
                color="primary"
                :size="size">
                {{ value[labelProp] || value }}
              </ds-chip>
            </slot>
          </div>
          <input
            ref="search"
            class="ds-select-search"
            autocomplete="off"
            :id="id"
            :name="name ? name : model"
            :autofocus="autofocus"
            :placeholder="placeholder"
            :tabindex="tabindex"
            :disabled="disabled"
            v-model="searchString"
            @focus="openAndFocus"
            @keydown.tab="closeAndBlur"
            @keydown.delete.stop="deselectLastOption"
            @keydown.down.prevent="handleKeyDown"
            @keydown.up.prevent="handleKeyUp"
            @keypress.enter.prevent.stop="selectPointerOption"
            @keyup.esc="close">
        </div>
        <div
          v-else
          class="ds-select-value">
          <!-- @slot Slot to provide a custom value display -->
          <slot
            v-if="innerValue"
            name="value"
            :value="innerValue">
            {{ innerValue[labelProp] || innerValue }}
          </slot>
          <div
            v-else-if="placeholder"
            class="ds-select-placeholder">
            {{ placeholder }}
          </div>
        </div>
        <input
          v-if="!multiple"
          ref="search"
          class="ds-select-search"
          autocomplete="off"
          :id="id"
          :name="name ? name : model"
          :autofocus="autofocus"
          :placeholder="placeholder"
          :tabindex="tabindex"
          :disabled="disabled"
          v-model="searchString"
          @focus="openAndFocus"
          @keydown.tab="closeAndBlur"
          @keydown.delete.stop="deselectLastOption"
          @keydown.down.prevent="handleKeyDown"
          @keydown.up.prevent="handleKeyUp"
          @keypress.enter.prevent.stop="selectPointerOption"
          @keyup.esc="close">
      </div>
      <div class="ds-select-dropdown">
        <div
          class="ds-select-dropdown-message"
          v-if="!options || !options.length">
          {{ noOptionsAvailable }}
        </div>
        <div
          class="ds-select-dropdown-message"
          v-else-if="!filteredOptions.length">
          {{ noOptionsFound }} "{{ searchString }}"
        </div>
        <ul
          class="ds-select-options"
          ref="options"
          v-else>
          <li
            class="ds-select-option"
            :class="[
              isSelected(option) && `ds-select-option-is-selected`,
              pointer === index && `ds-select-option-hover`
            ]"
            v-for="(option, index) in filteredOptions"
            @click="handleSelect(option)"
            @mouseover="setPointer(index)"
            :key="option[labelProp] || option">
            <!-- @slot Slot to provide custom option items -->
            <slot
              name="option"
              :option="option">
              {{ option[labelProp] || option }}
            </slot>
          </li>
        </ul>
      </div>
      <div
        v-if="iconRight"
        class="ds-select-icon-right">
        <ds-icon :name="iconRight" />
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
 * Used for letting the user choose values from a set of options.
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
      pointer: 0,
      isOpen: false
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
     * The prop to use as the label when options are objects
     */
    labelProp: {
      type: String,
      default: 'label'
    },
    /**
     * Whether the options are searchable
     */
    searchable: {
      type: Boolean,
      default: true
    },
    /**
     * Function to filter the results
     */
    filter: {
      type: Function,
      default: (option) => {
        const value = option.value || option
        return searchParts.every(part => {
          if (!part) {
            return true
          }
          return value.toLowerCase().includes(part.toLowerCase())
        })
      }
    },
    /**
     * Message to show when no options are available
     */
    noOptionsAvailable: {
      type: String,
      default: 'No options available.'
    },
    /**
     * Message to show when the search result is empty
     */
    noOptionsFound: {
      type: String,
      default: 'No options found for:'
    }
  },
  computed: {
    filteredOptions() {
      if (!this.searchString) {
        return this.options
      }
      const searchParts = this.searchString.split(' ')

      return this.options.filter(this.filter)
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
    openAndFocus() {
      this.open()
      if (!this.focus || this.multiple) {
        this.$refs.search.focus()
        this.handleFocus()
      }
    },
    open() {
      this.resetSearch()
      this.isOpen = true
    },
    close() {
      this.isOpen = false
    },
    closeAndBlur() {
      this.close()
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
    handleKeyUp() {
      if (!this.isOpen) {
        this.open()
        return
      }
      this.pointerPrev()
    },
    handleKeyDown() {
      if (!this.isOpen) {
        this.open()
        return
      }
      this.pointerNext()
    },
    setPointer(index) {
      if (!this.hadKeyboardInput) {
        this.pointer = index
      }
    },
    pointerPrev() {
      if (this.pointer === 0) {
        this.pointer = this.pointerMax
      } else {
        this.pointer--
      }
      this.scrollToHighlighted()
    },
    pointerNext() {
      if (this.pointer === this.pointerMax) {
        this.pointer = 0
      } else {
        this.pointer++
      }
      this.scrollToHighlighted()
    },
    scrollToHighlighted() {
      clearTimeout(this.hadKeyboardInput)
      if (!this.$refs.options || !this.$refs.options.children.length) {
        return
      }
      this.hadKeyboardInput = setTimeout(() => {
        this.hadKeyboardInput = null
      }, 250)
      this.$refs.options.children[this.pointer].scrollIntoView({
        block: 'nearest'
      });
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
