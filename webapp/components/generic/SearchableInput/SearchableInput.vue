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
        <a v-if="isActive" class="search-clear-btn" @click="clear">&nbsp;</a>
        <ds-select
          ref="input"
          class="input"
          name="search"
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
          <template slot="option" slot-scope="{ option }">
            <span v-if="isFirstOfType(option)" class="search-heading">
              <search-heading :resource-type="option.__typename" />
            </span>
            <span
              v-if="option.__typename === 'User'"
              :class="{ 'extra-space': isFirstOfType(option), 'flex-span': true }"
            >
              <hc-user :user="option" :showPopover="false" />
            </span>
            <span
              v-if="option.__typename === 'Post'"
              :class="{ 'extra-space': isFirstOfType(option), 'flex-span': true }"
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
      lastSearchTerm: '',
      delay: 300,
    }
  },
  computed: {
    emptyText() {
      return this.isActive && !this.pending ? this.$t('search.failed') : this.$t('search.hint')
    },
    isActive() {
      return !isEmpty(this.lastSearchTerm)
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
      this.value = event.target ? event.target.value.trim() : ''
      this.isOpen = true
      this.unprocessedSearchInput = this.value
      if (isEmpty(this.value) || this.value.length < 3) {
        return
      }
      this.searchProcess = setTimeout(() => {
        this.lastSearchTerm = this.value
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
        this.lastSearchTerm = this.unprocessedSearchInput
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
      this.lastSearchTerm = ''
      this.searchValue = ''
      this.$emit('clearSearch')
      clearTimeout(this.searchProcess)
    },
    onBlur(event) {
      this.searchValue = this.lastSearchTerm
      // this.$nextTick(() => {
      //   this.searchValue = this.lastSearchTerm
      // })
      this.isOpen = false
      clearTimeout(this.searchProcess)
    },
    onSelect(item) {
      this.isOpen = false
      this.goToResource(item)
      this.$nextTick(() => {
        this.searchValue = this.lastSearchTerm
      })
    },
    goToResource(item) {
      this.$nextTick(() => {
        switch (item.__typename) {
          case 'Post':
            this.$router.push({
              name: 'post-id-slug',
              params: { id: item.id, slug: item.slug },
            })
            break
          case 'User':
            this.$router.push({
              name: 'profile-id-slug',
              params: { id: item.id, slug: item.slug },
            })
            break
          default:
            break
        }
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
  .search-heading {
    display: flex;
    flex-wrap: wrap;
    font-weight: bold;
    cursor: default;
    background-color: white;
    margin: -8px;
    padding: 8px;
  }
  .extra-space {
    margin-top: 8px;
    padding-top: 4px;
  }
  .flex-span {
    display: flex;
    flex-wrap: wrap;
  }
  &,
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
