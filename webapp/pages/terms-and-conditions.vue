<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAc') }} ( vom: {{ latestDate_TaC }})</ds-heading>
    </ds-space>
    <div v-if="confirmed">
      <ds-section primary>
        <ds-flex>
          <ds-flex-item>
            <ds-logo inverse></ds-logo>
          </ds-flex-item>
          <ds-flex-item width="4">
            <ds-heading>you have confirmed</ds-heading>
            <ds-text v-if="confirmed">
  {{ $t('terms-and-conditions.confirmed') }}
              {{ latestDate_TaC_UserConfirmed }}.
              <br />
              You will be informed if there is a change in the Terms and Conditions.
            </ds-text>
          </ds-flex-item>
        </ds-flex>
      </ds-section>
    </div>
    <div v-else>
      <ds-section class="hasNoConfirm" secondary>
        <ds-flex>
          <ds-flex-item>
            <ds-logo inverse></ds-logo>
          </ds-flex-item>
          <ds-flex-item width="4">
            <ds-heading>Our terms and conditions have changed.</ds-heading>
            <ds-text>
              Please confirm the AGB. The AGB have changed on {{ latestDate_TaC_update }}!
              <br />
              Your last confirmation was on {{ latestDate_TaC_UserConfirmed }}.
            </ds-text>
          </ds-flex-item>
          <ds-flex-item width="1">
            <ds-button primary>confirm</ds-button>
          </ds-flex-item>
        </ds-flex>
      </ds-section>
    </div>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.termsAc') }}</ds-text>
        <ds-text v-html="$t('terms.text')"></ds-text>
      </ds-space>
    </ds-container>
    <div v-if="confirmed === false">
      <ds-section class="hasNoConfirm" secondary>
        <ds-flex>
          <ds-flex-item>
            <ds-logo inverse></ds-logo>
          </ds-flex-item>
          <ds-flex-item width="4">
            <ds-heading>Our terms and conditions have changed.</ds-heading>
            <ds-text>
              Please confirm the AGB. The AGB have changed on {{ latestDate_TaC_update }}!
              <br />
              Your last confirmation was on {{ latestDate_TaC_UserConfirmed }}.
            </ds-text>
          </ds-flex-item>
          <ds-flex-item width="1">
            <ds-button primary>confirm</ds-button>
          </ds-flex-item>
        </ds-flex>
      </ds-section>
    </div>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t('site.termsAc'),
    }
  },
  data() {
    return {
      confirmed: false,
      termsAndConditionsVersion: '1.0.0',
    }
  },
}
</script>
