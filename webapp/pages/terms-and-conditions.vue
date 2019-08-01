<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAc') }}</ds-heading>
      <small>Version: {{ termsAndConditionsVersion }}</small>
    </ds-space>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.termsAc') }}</ds-text>
        <ds-text v-html="$t('terms.text')"></ds-text>
      </ds-space>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'blank',
  head() {
    return {
      title: this.$t('site.termsAc'),
    }
  },
  data() {
    return {
      termsAndConditionsVersion: '1.0.0',
    }
  },
}
</script>
