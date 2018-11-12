/**
 * @mixin
 */
export default {
  props: {
    /**
     * Whether the user can select multiple items
     */
    multiple: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    selectOption(option) {
      const newValue = option.value || option
      if (this.multiple) {
        this.selectMultiOption(newValue)
      } else {
        this.input(newValue)
      }
    },
    selectMultiOption(value) {
      if (!this.innerValue) {
        return this.input([value])
      }
      const index = this.innerValue.indexOf(value)
      if (index < 0) {
        return this.input([...this.innerValue, value])
      }
      this.deselectOption(index)
    },
    deselectOption(index) {
      const newArray = [...this.innerValue]
      newArray.splice(index, 1)
      this.input(newArray)
    },
    isSelected(option) {
      if (!this.innerValue) {
        return false
      }
      const value = option.value || option
      if (this.multiple) {
        return this.innerValue.includes(value)
      }
      return this.innerValue === value
    }
  }
}
