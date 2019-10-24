<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <div>
        <ol>
          <li v-for="section in sections" :key="section">
            <strong>{{ $t(`termsAndConditions.${section}.title`) }}:</strong>
            <p v-html="$t(`termsAndConditions.${section}.description`)" />
          </li>
        </ol>
      </div>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'basic',
  head() {
    return {
      title: this.$t('site.termsAndConditions'),
    }
  },
  data() {
    return {
      // if you change terms and conditions please change also version in file "webapp/constants/terms-and-conditions-version.js"
      sections: [
        'terms-of-service',
        'use-and-license',
        'privacy-statement',
        'code-of-conduct',
        'moderation',
        'errors-and-feedback',
        'help-and-questions',
        'addition',
      ],
    }
  },
}
</script>
