<template>
  <ds-flex class="search-post">
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
            <span class="post-shouted">
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
.search-meta {
  float: right;
  padding-top: 2px;
  white-space: nowrap;
  word-wrap: none;
  .base-icon {
    vertical-align: sub;
  }
}
.post-shouted {
  width: 36px;
  display: inline-block;
  text-align: right;
}
</style>
