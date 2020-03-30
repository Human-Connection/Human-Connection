<template>
  <section class="search-post">
    <p class="label">{{ option.title | truncate(70) }}</p>
    <span class="metadata">
      <span class="counts">
        {{ option.commentsCount }}
        <base-icon name="comments" />
        {{ option.shoutedCount }}
        <base-icon name="bullhorn" />
      </span>
      <span>
        {{ option.author.name | truncate(32) }} -
        {{ option.createdAt | dateTime('dd.MM.yyyy') }}
      </span>
    </span>
  </section>
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
  display: flex;

  > .label {
    flex-grow: 1;
    padding-left: $space-x-small;
    font-size: $font-size-base;
  }

  > .metadata {
    display: flex;
    flex-direction: column;
    white-space: nowrap;
    padding-top: $space-xxx-small;
    color: $text-color-softer;
    font-size: $font-size-small;

    > .counts {
      display: flex;
      flex-grow: 1;
      justify-content: flex-end;
      font-weight: $font-weight-bold;
      > .base-icon {
        margin-left: $space-xxx-small;
      }

      > .base-icon:first-child {
        margin-right: $font-size-small;
      }
    }
  }
}
</style>
