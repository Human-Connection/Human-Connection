<template>
  <div
    class="search"
    aria-label="search"
    role="search"
    :class="{ 'is-active': isActive }"
  >
    <div class="field">
      <div class="control has-icons-left has-icons-right">
        <input
          :id="id"
          ref="input"
          v-model="searchValue"
          v-focus="focus"
          class="input"
          name="search"
          type="text"
          placeholder="Search..."
          @keyup.exact="onInput"
          @keyup.enter="onEnter"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'

export default {
  name: 'HcSearchInput',
  props: {
    id: {
      type: String,
      default: 'nav-search'
    },
    value: {
      type: String,
      default: ''
    },
    delay: {
      type: Number,
      default: 700
    },
    focus: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchValue: '',
      searchProcess: null,
      searching: false
    }
  },
  computed: {
    isActive() {
      return !isEmpty(this.searchValue)
    }
  },
  watch: {
    value(value) {
      this.$nextTick(() => {
        this.updateValue()
      })
    }
  },
  mounted() {
    this.updateValue()
  },
  methods: {
    updateValue() {
      if (!this.value) {
        this.searchValue = ''
      } else if (this.value.toString() !== this.searchValue.toString()) {
        this.searchValue = this.value.toString()
      }
    },
    onInput() {
      clearTimeout(this.searchProcess)
      this.searching = true
      // skip on less then three letters
      if (this.searchValue && this.searchValue.toString().length < 3) {
        return
      }
      // skip if nothing changed
      if (this.searchValue === this.value) {
        return
      }
      this.searchProcess = setTimeout(() => {
        this.searching = false
        this.$emit('search', this.searchValue.toString())
      }, this.delay)
    },
    onEnter() {
      clearTimeout(this.searchProcess)
      this.$nextTick(() => {
        clearTimeout(this.searchProcess)
      })
      this.searching = false
      this.$emit('search', this.searchValue.toString())
    },
    clear() {
      clearTimeout(this.searchProcess)
      this.searching = false
      this.searchValue = ''
      if (this.value !== this.searchValue) {
        this.$emit('search', '')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.search {
  display: flex;
  width: 100%;
  position: relative;

  .field {
    width: 100%;
    display: flex;
    align-items: center;
  }

  .control {
    width: 100%;
    input {
      width: 100%;
      border-radius: 2px;
      height: 2.5em;
      padding-left: 2em;
      padding-right: 1em;
      font-size: 1em;
      transition-duration: 0.15s;
      transition-timing-function: ease-out;
      transition-property: border, background-color;

      & {
        border-color: hsl(0, 0%, 96%);
      }
    }
  }

  input {
    padding-right: 2em !important;
    background-color: hsl(0, 0%, 96%);
  }

  input:hover {
    background-color: hsl(0, 0%, 98%);
  }

  input:focus,
  &.is-active input.input {
    background-color: hsl(0, 0%, 98%);
  }

  .icon {
    height: 2.5em;
    font-size: 1em;

    &.btn-clear {
      position: absolute;
      right: 0.25rem;
      cursor: pointer !important;
      z-index: 10;
      padding-left: 1em;
      padding-right: 1em;
    }
  }

  &.is-active .icon {
    color: hsl(0, 0%, 71%);
  }
}
</style>
