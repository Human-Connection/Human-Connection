<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <div>
        <ol>
          <li v-for="section in sections" :key="section">
            <strong>{{ $t(`termsAndConditions.${section}.title`) }}:</strong>  <!-- i18n-variable  -->

<!-- i18n $t(`termsAndConditions.terms-of-service.title`)           -->
<!-- i18n $t(`termsAndConditions.use-and-license.title`)            -->
<!-- i18n $t(`termsAndConditions.privacy-statement.title`)          -->
<!-- i18n $t(`termsAndConditions.code-of-conduct.title`)            -->
<!-- i18n $t(`termsAndConditions.moderation.title`)                 -->
<!-- i18n $t(`termsAndConditions.errors-and-feedback.title`)        -->
<!-- i18n $t(`termsAndConditions.help-and-questions.title`)         -->
<!-- i18n $t(`termsAndConditions.addition.title`)                   -->

            <p v-html="$t(`termsAndConditions.${section}.description`)" />   <!-- i18n-variable  -->

<!-- i18n $t(`termsAndConditions.terms-of-service.description`)     -->
<!-- i18n $t(`termsAndConditions.use-and-license.description`)      -->
<!-- i18n $t(`termsAndConditions.privacy-statement.description`)    -->
<!-- i18n $t(`termsAndConditions.code-of-conduct.description`)      -->
<!-- i18n $t(`termsAndConditions.moderation.description`)           -->
<!-- i18n $t(`termsAndConditions.errors-and-feedback.description`)  -->
<!-- i18n $t(`termsAndConditions.help-and-questions.description`)   -->
<!-- i18n $t(`termsAndConditions.addition.description`)             -->

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
