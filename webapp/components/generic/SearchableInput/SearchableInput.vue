<template>
  <div class="searchable-input" aria-label="search" role="search">
    <ds-select
      type="search"
      icon="search"
      v-model="searchValue"
      :id="id"
      label-prop="id"
      :icon-right="null"
      :options="options"
      :loading="loading"
      :filter="(item) => item"
      :no-options-available="emptyText"
      :auto-reset-search="!searchValue"
      :placeholder="$t('search.placeholder')"
      @focus.capture.native="onFocus"
      @input.native="handleInput"
      @keyup.enter.native="onEnter"
      @keyup.delete.native="onDelete"
      @keyup.esc.native="clear"
      @blur.capture.native="onBlur"
      @input.exact="onSelect"
    >
      <template #option="{ option }">
        <search-heading v-if="isFirstOfType(option)" :resource-type="option.__typename" />
        <p
          v-if="option.__typename === 'User'"
          :class="{ 'option-with-heading': isFirstOfType(option) }"
        >
          <user-teaser :user="option" :showPopover="false" />
        </p>
        <p
          v-if="option.__typename === 'Post'"
          :class="{ 'option-with-heading': isFirstOfType(option) }"
        >
          <search-post :option="option" />
        </p>
        <p
          v-if="option.__typename === 'Tag'"
          :class="{ 'option-with-heading': isFirstOfType(option) }"
        >
          <hc-hashtag :id="option.id" />
        </p>
      </template>
    </ds-select>
    <base-button v-if="isActive" icon="close" circle ghost size="small" @click="clear" />
  </div>
</template>

<script>
import { isEmpty } from 'lodash'
import SearchHeading from '~/components/generic/SearchHeading/SearchHeading.vue'
import SearchPost from '~/components/generic/SearchPost/SearchPost.vue'
import HcHashtag from '~/components/Hashtag/Hashtag.vue'
import UserTeaser from '~/components/UserTeaser/UserTeaser.vue'

export default {
  name: 'SearchableInput',
  components: {
    SearchHeading,
    SearchPost,
    HcHashtag,
    UserTeaser,
  },
  props: {
    id: { type: String },
    loading: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
  },
  data() {
    return {
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
      return this.isActive && !this.loading ? this.$t('search.failed') : this.$t('search.hint')
    },
    isActive() {
      return !isEmpty(this.previousSearchTerm)
    },
  },
  methods: {
    isFirstOfType(option) {
      return (
        this.options.findIndex((o) => o === option) ===
        this.options.findIndex((o) => o.__typename === option.__typename)
      )
    },
    onFocus(event) {
      clearTimeout(this.searchProcess)
    },
    handleInput(event) {
      clearTimeout(this.searchProcess)
      this.value = event.target ? event.target.value.replace(/\s+/g, ' ').trim() : ''
      this.unprocessedSearchInput = this.value
      if (isEmpty(this.value) || this.value.replace(/\s+/g, '').length < 3) {
        return
      }
      this.searchProcess = setTimeout(() => {
        this.previousSearchTerm = this.value
        this.$emit('query', this.value)
      }, this.delay)
    },
    onEnter(event) {
      this.$router.push({
        path: '/search/search-results',
        query: { search: this.unprocessedSearchInput },
      })
      this.$emit('clearSearch')
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
      this.unprocessedSearchInput = ''
      this.previousSearchTerm = ''
      this.searchValue = ''
      this.$emit('clearSearch')
      clearTimeout(this.searchProcess)
    },
    onBlur(event) {
      this.searchValue = this.previousSearchTerm
      clearTimeout(this.searchProcess)
    },
    onSelect(item) {
      this.goToResource(item)
      this.$nextTick(() => {
        this.searchValue = this.previousSearchTerm
      })
    },
    isPost(item) {
      return item.__typename === 'Post'
    },
    isTag(item) {
      return item.__typename === 'Tag'
    },
    goToResource(item) {
      this.$nextTick(() => {
        if (!this.isTag(item)) {
          this.$router.push({
            name: this.isPost(item) ? 'post-id-slug' : 'profile-id-slug',
            params: { id: item.id, slug: item.slug },
          })
        } else {
          this.$router.push('?hashtag=' + item.id)
        }
      })
    },
  },
}
</script>

<style lang="scss">
.searchable-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  .ds-form-item {
    flex-basis: 100%;
    margin-bottom: 0;
  }

  .ds-select-dropdown {
    max-height: 70vh;
    box-shadow: $box-shadow-x-large;
  }

  .option-with-heading {
    margin-top: $space-x-small;
    padding-top: $space-xx-small;
  }

  .base-button {
    position: absolute;
    right: $space-xx-small;
  }
}
</style>
