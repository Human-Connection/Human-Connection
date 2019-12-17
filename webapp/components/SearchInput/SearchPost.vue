<template>
  <ds-flex class="post-search-item">
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
<script>
export default {
  name: 'SearchPost',
  props: {
    option: { type: Object, required: true },
  },
}
</script>
<style>
.post-search-item {
  width: 100%;
}
</style>
