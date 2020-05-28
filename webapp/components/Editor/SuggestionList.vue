<template>
  <ul v-show="showSuggestions" class="suggestion-list">
    <li
      v-for="(item, index) in filteredItems"
      :key="item.id"
      class="suggestion-list__item"
      :class="{ 'is-selected': navigatedItemIndex === index }"
      @click="selectItem(item)"
    >
      {{ createItemLabel(item) | truncate(50) }}
    </li>
    <template v-if="isHashtag">
      <li v-if="!query" class="suggestion-list__item hint">{{ $t('editor.hashtag.addLetter') }}</li>
      <template v-else-if="!filteredItems.find((el) => el.id === query)">
        <li class="suggestion-list__item hint">{{ $t('editor.hashtag.addHashtag') }}</li>
        <li class="suggestion-list__item" @click="selectItem({ id: query })">
          #{{ query | truncate(50) }}
        </li>
      </template>
    </template>
    <template v-else-if="isMention">
      <li v-if="!hasResults" class="suggestion-list__item hint">
        {{ $t('editor.mention.noUsersFound') }}
      </li>
    </template>
  </ul>
</template>

<script>
import { HASHTAG, MENTION } from '../../constants/editor'

export default {
  props: {
    suggestionType: String,
    filteredItems: Array,
    query: String,
    navigatedItemIndex: Number,
    selectItem: Function,
  },
  computed: {
    hasResults() {
      return this.filteredItems.length > 0
    },
    isMention() {
      return this.suggestionType === MENTION
    },
    isHashtag() {
      return this.suggestionType === HASHTAG
    },
    showSuggestions() {
      return this.query || this.hasResults
    },
  },
  methods: {
    createItemLabel(item) {
      if (this.isMention) {
        return `@${item.slug}`
      } else {
        return `#${item.id}`
      }
    },
  },
}
</script>

<style lang="scss">
.suggestion-list {
  list-style-type: none;
  padding: 0.2rem;
  border-radius: 5px;
  border: 2px solid $color-primary;
  font-size: 0.8rem;
  font-weight: bold;
}

.suggestion-list__item {
  border-radius: 5px;
  padding: 0.2rem 0.5rem;
  margin-bottom: 0.2rem;
  cursor: pointer;

  &:last-child {
    margin-bottom: 0;
  }

  &.is-selected,
  &:hover {
    background-color: rgba($color-neutral-100, 0.3);
  }

  &.hint {
    opacity: $opacity-soft;
    pointer-events: none;
  }
}
</style>
