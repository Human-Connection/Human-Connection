<template>
  <div class="suggestion-list">
    <!-- "filteredItems" array is not empty -->
    <template v-if="hasResults">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="suggestion-list__item"
        :class="{ 'is-selected': navigatedItemIndex === index }"
        @click="selectItem(item)"
      >
        <div v-if="isMention">@{{ item.slug }}</div>
        <div v-if="isHashtag">#{{ item.id }}</div>
      </div>
      <div v-if="isHashtag">
        <!-- if query is not empty and is find fully in the suggestions array ... -->
        <div v-if="query && !filteredItems.find(el => el.id === query)">
          <div class="suggestion-list__item is-empty">{{ $t('editor.hashtag.addHashtag') }}</div>
          <div class="suggestion-list__item" @click="selectItem({ id: query })">#{{ query }}</div>
        </div>
        <!-- otherwise if sanitized query is empty advice the user to add a char -->
        <div v-else-if="!query">
          <div class="suggestion-list__item is-empty">{{ $t('editor.hashtag.addLetter') }}</div>
        </div>
      </div>
    </template>
    <!-- if "!hasResults" -->
    <div v-else>
      <div
        v-if="isMention"
        class="suggestion-list__item is-empty"
      >{{ $t('editor.mention.noUsersFound') }}</div>
      <div v-if="isHashtag">
        <div
          v-if="query === ''"
          class="suggestion-list__item is-empty"
        >{{ $t('editor.hashtag.noHashtagsFound') }}</div>
        <!-- if "query" is not empty -->
        <div v-else>
          <div class="suggestion-list__item is-empty">{{ $t('editor.hashtag.addHashtag') }}</div>
          <div class="suggestion-list__item" @click="selectItem({ id: query })">#{{ query }}</div>
        </div>
      </div>
    </div>
  </div>
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
    hasResults: Number,
  },
  computed: {
    isMention() {
      return this.suggestionType === MENTION
    },
    isHashtag() {
      return this.suggestionType === HASHTAG
    },
  },
}
</script>
