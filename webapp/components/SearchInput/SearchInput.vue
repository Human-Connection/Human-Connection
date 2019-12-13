<template>
  <div
    class="search"
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
          :id="id"
          ref="input"
          v-model="searchValue"
          class="input"
          name="search"
          type="search"
          icon="search"
          label-prop="id"
          :no-options-available="emptyText"
          :icon-right="isActive ? 'close' : null"
          :filter="item => item"
          :options="searchResults"
          :auto-reset-search="!searchValue"
          :placeholder="$t('search.placeholder')"
          :loading="pending"
          @keyup.enter.native="onEnter"
          @focus.capture.native="onFocus"
          @blur.capture.native="onBlur"
          @keyup.delete.native="onDelete"
          @keyup.esc.native="clear"
          @input.exact="onSelect"
          @input.native="handleInput"
          @click.capture.native="isOpen = true"
        >
          <template slot="option" slot-scope="{ option }">
            <ds-flex v-if="isFirstOfType(option)" class="search-option-heading">
              <ds-flex-item>
                <ds-heading soft size="h5">
                  {{ $t(`search.heading.${option.__typename}`) }}
                </ds-heading>
              </ds-flex-item>
            </ds-flex>
            <ds-flex v-if="option.__typename === 'User'">
              <ds-flex-item class="search-option" :class="{ 'extra-space': isFirstOfType(option) }">
                <ds-avatar class="avatar" name="option.name" image="option.avatar" />
                <div>
                  <ds-text class="userinfo">
                    <b class="username">{{ option.name | truncate(70) }}</b>
                  </ds-text>
                </div>
                <ds-text align="left" size="small" color="soft">
                  @{{ option.slug | truncate(70) }}
                </ds-text>
              </ds-flex-item>
            </ds-flex>
            <ds-flex v-if="option.__typename === 'Post'">
              <ds-flex-item class="search-option-label">
                <ds-text>{{ option.title | truncate(70) }}</ds-text>
              </ds-flex-item>
              <ds-flex-item class="search-option-meta" width="280px">
                <ds-flex>
                  <ds-flex-item>
                    <ds-text size="small" color="softer" class="search-meta">
                      <span style="text-align: right;">
                        <b>{{ option.commentsCount }}</b>
                        <base-icon name="comments" />
                      </span>
                      <span style="width: 36px; display: inline-block; text-align: right;">
                        <b>{{ option.shoutedCount }}</b>
                        <base-icon name="bullhorn" />
                      </span>
                    </ds-text>
                  </ds-flex-item>
                  <ds-flex-item>
                    <ds-text size="small" color="softer" align="right">
                      {{ option.author.name | truncate(32) }} -
                      {{ option.createdAt | dateTime('dd.MM.yyyy') }}
                    </ds-text>
                  </ds-flex-item>
                </ds-flex>
              </ds-flex-item>
            </ds-flex>
          </template>
        </ds-select>
      </div>
    </div>
  </div>
</template>

<script>
import { isEmpty } from 'lodash'
import { findResourcesQuery } from '~/graphql/Search.js'

export default {
  name: 'SearchInput',
  props: {
    id: {
      type: String,
      default: 'nav-search',
    },
    delay: {
      type: Number,
      default: 300,
    },
  },
  data() {
    return {
      searchProcess: null,
      value: '',
      pending: false,
      isOpen: false,
      lastSearchTerm: '',
      unprocessedSearchInput: '',
      searchValue: '',
      quickValue: '',
      searchResults: [],
    }
  },
  computed: {
    // #: Unused at the moment?
    isActive() {
      return !isEmpty(this.lastSearchTerm)
    },
    emptyText() {
      return this.isActive && !this.pending ? this.$t('search.failed') : this.$t('search.hint')
    },
  },
  methods: {
    async query(value) {
      if (
        isEmpty(value) ||
        value.length < 3 ||
        this.quickValue.toLowerCase() === value.toLowerCase()
      ) {
        this.clear()
        return
      }
      this.quickValue = value
      this.pending = true
      try {
        const {
          data: { findResources },
        } = await this.$apollo.query({
          query: findResourcesQuery,
          variables: {
            query: value,
          },
        })
        this.searchResults = findResources
      } catch (error) {
        this.searchResults = []
      } finally {
        this.pending = false
      }
    },
    handleInput(e) {
      clearTimeout(this.searchProcess)
      this.value = e.target ? e.target.value.trim() : ''
      this.isOpen = true
      this.unprocessedSearchInput = this.value
      this.searchProcess = setTimeout(() => {
        this.lastSearchTerm = this.value
        this.query(this.value)
      }, this.delay)
    },
    onSelect(item) {
      this.isOpen = false
      this.$emit('select', item)
      this.$nextTick(() => {
        this.searchValue = this.lastSearchTerm
      })
    },
    onFocus(e) {
      clearTimeout(this.searchProcess)
      this.isOpen = true
    },
    onBlur(e) {
      this.searchValue = this.lastSearchTerm
      // this.$nextTick(() => {
      //   this.searchValue = this.lastSearchTerm
      // })
      this.isOpen = false
      clearTimeout(this.searchProcess)
    },
    onDelete(e) {
      clearTimeout(this.searchProcess)
      const value = e.target ? e.target.value.trim() : ''
      if (isEmpty(value)) {
        this.clear()
      } else {
        this.handleInput(e)
      }
    },
    /**
     * TODO: on enter we should go to a dedicated search page!?
     */
    onEnter(e) {
      // this.isOpen = false
      clearTimeout(this.searchProcess)
      if (!this.pending) {
        // this.lastSearchTerm = this.unprocessedSearchInput
        this.query(this.unprocessedSearchInput)
      }
    },
    clear() {
      this.pending = false
      this.searchResults = []
      this.quickValue = ''
      clearTimeout(this.searchProcess)
      this.isOpen = false
      this.unprocessedSearchInput = ''
      this.lastSearchTerm = ''
      this.searchValue = ''
    },
    isFirstOfType(option) {
      return (
        this.searchResults.findIndex(o => o === option) ===
        this.searchResults.findIndex(o => o.__typename === option.__typename)
      )
    },
  },
}
</script>

<style lang="scss">
.search {
  display: flex;
  align-self: center;
  width: 100%;
  position: relative;
  $padding-left: $space-x-small;
  .search-option-label {
    align-self: center;
    padding-left: $padding-left;
  }
  .search-option-meta {
    align-self: center;
    .ds-flex {
      flex-direction: column;
    }
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
  .search-meta {
    float: right;
    padding-top: 2px;
    white-space: nowrap;
    word-wrap: none;
    .base-icon {
      vertical-align: sub;
    }
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
  .search-option-heading {
    font-weight: bold;
    cursor: default;
    background-color: white;
    margin: -8px;
    padding: 8px;
  }
  .avatar {
    display: inline-block;
    float: left;
    margin-right: 4px;
    height: 100%;
    vertical-align: middle;
  }
  .userinfo {
    display: flex;
    align-items: center;
    > .ds-text {
      display: flex;
      align-items: center;
      margin-left: $space-xx-small;
    }
  }
  .user {
    white-space: nowrap;
    position: relative;
    display: flex;
    align-items: center;
    &:hover,
    &.active {
      z-index: 999;
    }
  }
  .username {
    color: #17b53f;
  }
  .extra-space {
    margin-top: 8px;
    padding-top: 4px;
  }
}
</style>
