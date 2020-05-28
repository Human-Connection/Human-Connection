<template>
  <section class="search-post">
    <p class="label">{{ option.title | truncate(70) }}</p>
    <div class="metadata">
      <span class="counts">
        <counter-icon icon="comments" :count="option.commentsCount" soft />
        <counter-icon icon="bullhorn" :count="option.shoutedCount" soft />
      </span>
      {{ option.author.name | truncate(32) }} - {{ option.createdAt | dateTime('dd.MM.yyyy') }}
    </div>
  </section>
</template>

<script>
import CounterIcon from '~/components/_new/generic/CounterIcon/CounterIcon'

export default {
  components: {
    CounterIcon,
  },
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
    padding: 0 $space-x-small;
  }

  > .metadata {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: $text-color-softer;
    font-size: $font-size-small;

    > .counts > .counter-icon {
      margin: 0 $space-x-small;
    }
  }
}
</style>
