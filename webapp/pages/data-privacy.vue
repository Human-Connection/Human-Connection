<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.dataPrivacy') }}</ds-heading>
    </ds-space>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.dataPrivacy') }}</ds-text>
        <ds-text v-html="$t('data-privacy.text')"></ds-text>
      </ds-space>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  head() {
    return {
      title: this.$t('site.dataPrivacy'),
    }
  },
}
</script>
