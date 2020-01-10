<template>
  <div
    class="searchable-input"
    aria-label="search"
    role="search"
    :class="{
      'is-active': isActive,
      'is-open': isOpen,
    }"
  >
    <div class="field">
      <div class="control">
        <ds-button v-if="isActive" icon="close" ghost class="search-clear-btn" @click="clear" />
        <ds-select
          type="search"
          icon="search"
          v-model="searchValue"
          :id="id"
          label-prop="id"
          :icon-right="isActive ? 'close' : null"
          :options="options"
          :loading="loading"
          :filter="item => item"
          :no-options-available="emptyText"
          :auto-reset-search="!searchValue"
          :placeholder="$t('search.placeholder')"
          @click.capture.native="isOpen = true"
          @focus.capture.native="onFocus"
          @input.native="handleInput"
          @keyup.enter.native="onEnter"
          @keyup.delete.native="onDelete"
          @keyup.esc.native="clear"
          @blur.capture.native="onBlur"
          @input.exact="onSelect"
        >
          <template #option="{ option }">
            <span v-if="isFirstOfType(option)" class="search-heading">
              <search-heading :resource-type="option.__typename" />
            </span>
            <span
              v-if="option.__typename === 'User'"
              :class="{ 'option-with-heading': isFirstOfType(option), 'flex-span': true }"
            >
              <hc-user :user="option" :showPopover="false" />
            </span>
            <span
              v-if="option.__typename === 'Post'"
              :class="{ 'option-with-heading': isFirstOfType(option), 'flex-span': true }"
            >
              <search-post :option="option" />
            </span>
          </template>
        </ds-select>
      </div>
    </div>
  </div>
</template>
<script>
import { isEmpty } from 'lodash'
import SearchHeading from '~/components/generic/SearchHeading/SearchHeading.vue'
import SearchPost from '~/components/generic/SearchPost/SearchPost.vue'
import HcUser from '~/components/User/User.vue'

export default {
  name: 'SearchableInput',
  components: {
    SearchHeading,
    SearchPost,
    HcUser,
  },
  props: {
    id: { type: String },
    loading: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
  },
  data() {
    return {
      isOpen: false,
      searchValue: '',
      value: '',
      unprocessedSearchInput: '',
      searchProcess: null,
      previousSearchTerm: '',
      delay: 300,
    }
  },
  computed: {
    emptyText() {
      return this.isActive && !this.pending ? this.$t('search.failed') : this.$t('search.hint')
    },
    isActive() {
      return !isEmpty(this.previousSearchTerm)
    },
  },
  methods: {
    isFirstOfType(option) {
      return (
        this.options.findIndex(o => o === option) ===
        this.options.findIndex(o => o.__typename === option.__typename)
      )
    },
    onFocus(event) {
      clearTimeout(this.searchProcess)
      this.isOpen = true
    },
    handleInput(event) {
      clearTimeout(this.searchProcess)
      this.value = event.target ? event.target.value.replace(/\s+/g, ' ').trim() : ''
      this.isOpen = true
      this.unprocessedSearchInput = this.value
      if (isEmpty(this.value) || this.value.replace(/\s+/g, '').length < 3) {
        return
      }
      this.searchProcess = setTimeout(() => {
        this.previousSearchTerm = this.value
        this.$emit('query', this.value)
      }, this.delay)
    },
    /**
     * TODO: on enter we should go to a dedicated search page!?
     */
    onEnter(event) {
      this.isOpen = false
      clearTimeout(this.searchProcess)
      if (!this.pending) {
        this.previousSearchTerm = this.unprocessedSearchInput
        this.$emit('query', this.unprocessedSearchInput)
      }
    },
    onDelete(event) {
      clearTimeout(this.searchProcess)
      const value = event.target ? event.target.value.trim() : ''
      if (isEmpty(value)) {
        this.clear()
      } else {
        this.handleInput(event)
      }
    },
    clear() {
      this.isOpen = false
      this.unprocessedSearchInput = ''
      this.previousSearchTerm = ''
      this.searchValue = ''
      this.$emit('clearSearch')
      clearTimeout(this.searchProcess)
    },
    onBlur(event) {
      this.searchValue = this.previousSearchTerm
      this.isOpen = false
      clearTimeout(this.searchProcess)
    },
    onSelect(item) {
      this.isOpen = false
      this.goToResource(item)
      this.$nextTick(() => {
        this.searchValue = this.previousSearchTerm
      })
    },
    isPost(item) {
      return item.__typename === 'Post'
    },
    goToResource(item) {
      this.$nextTick(() => {
        this.$router.push({
          name: this.isPost(item) ? 'post-id-slug' : 'profile-id-slug',
          params: { id: item.id, slug: item.slug },
        })
      })
    },
  },
}
</script>
<style lang="scss">
.searchable-input {
  display: flex;
  align-self: center;
  width: 100%;
  position: relative;
  $padding-left: $space-x-small;
  .option-with-heading {
    margin-top: $space-x-small;
    padding-top: $space-xx-small;
  }
  .flex-span {
    display: flex;
    flex-wrap: wrap;
  }
  .ds-select-dropdown {
    transition: box-shadow 100ms;
    max-height: 70vh;
  }
  &.is-open {
    .ds-select-dropdown {
      box-shadow: $box-shadow-x-large;
    }
  }
  .ds-select-dropdown-message {
    opacity: 0.5;
    padding-left: $padding-left;
  }
  .search-clear-btn {
    right: 0;
    z-index: 10;
    position: absolute;
    height: 100%;
    width: 36px;
    cursor: pointer;
  }
  .ds-select {
    z-index: $z-index-dropdown + 1;
  }
  .ds-select-option-hover {
    .ds-text-size-small,
    .ds-text-size-small-x {
      color: $text-color-soft;
    }
  }
  .field {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .control {
    width: 100%;
  }
}
</style>
