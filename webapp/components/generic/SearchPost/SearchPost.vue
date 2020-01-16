<template>
  <ds-flex class="search-post">
    <ds-flex-item class="search-option-label">
      <ds-text>{{ option.title | truncate(70) }}</ds-text>
    </ds-flex-item>
    <ds-flex-item class="search-option-meta" width="280px">
      <ds-flex>
        <ds-flex-item>
          <ds-text size="small" color="softer" class="search-post-meta">
            <span class="comments-count">
              {{ option.commentsCount }}
              <base-icon name="comments" />
            </span>
            <span class="shouted-count">
              {{ option.shoutedCount }}
              <base-icon name="bullhorn" />
            </span>
          </ds-text>
        </ds-flex-item>
        <ds-flex-item>
          <ds-text size="small" color="softer" align="right" class="search-post-author">
            {{ option.author.name | truncate(32) }} -
            {{ option.createdAt | dateTime('dd.MM.yyyy') }}
          </ds-text>
        </ds-flex-item>
      </ds-flex>
    </ds-flex-item>
  </ds-flex>
</template>
<script>
export default {
  name: 'SearchPost',
  props: {
    option: { type: Object, required: true },
  },
}
</script>
<style lang="scss">
.search-post {
  width: 100%;
}
.search-option-label {
  align-self: center;
  padding-left: $space-x-small;
}
.search-option-meta {
  align-self: center;
  .ds-flex {
    flex-direction: column;
  }
}
.search-post-meta {
  float: right;
  padding-top: 2px;
  white-space: nowrap;
  word-wrap: none;
  .base-icon {
    vertical-align: sub;
  }
}
.shouted-count {
  width: 36px;
  display: inline-block;
  text-align: right;
  font-weight: $font-weight-bold;
}
.comments-count {
  text-align: right;
  font-weight: $font-weight-bold;
}
</style>
