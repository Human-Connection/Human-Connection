<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.termsAndConditions') }}</ds-text>

        <div>
          <ol>
            <li>
              <strong>{{ $t('termsAndConditions.text0') }}</strong>
              {{ $t('termsAndConditions.text1') }}
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text2') }}</strong>
              {{ $t('termsAndConditions.text3') }}
              <a href="/pages/privacy" target="_blank">{{ $t('termsAndConditions.text4') }}</a>
              .
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text5') }}</strong>
              {{ $t('termsAndConditions.text6') }}
              <a
                href="http://localhost:3000/%22https://human-connection.org/alpha/#bugreport%5C%22"
                target="_blank"
              >
                https://human-connection.org/support
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text7') }}</strong>
              {{ $t('termsAndConditions.text8') }}
              <a href="https://alpha.human-connection.org/pages/code-of-conduct" target="_blank">
                https://alpha.human-connection.org/pages/code-of-conduct
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text9') }}</strong>
              {{ $t('termsAndConditions.text10') }}
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text11') }}</strong>
              {{ $t('termsAndConditions.text12') }}
              <a href="mailto:info@human-connection.org" target="_blank">
                info@human-connection.org
              </a>
              <strong>{{ $t('termsAndConditions.text13') }}</strong>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text14') }}</strong>
              {{ $t('termsAndConditions.text15') }}
              <a
                href="http://localhost:3000/%22https://human-connection.org/events-und-news//%22"
                target="_blank"
              >
                https://human-connection.org/veranstaltungen/
              </a>
            </li>
            <br />
            <li>
              <strong>{{ $t('termsAndConditions.text16') }}</strong>
              {{ $t('termsAndConditions.text17') }}
              <a
                href="http://localhost:3000/%22https://human-connection.org/alpha/#bugreport%5C%22"
                target="_blank"
              >
                https://human-connection.org
              </a>
            </li>
          </ol>
          <p>{{ $t('termsAndConditions.text18') }}</p>
          <br />
          <p>
            <strong>{{ $t('termsAndConditions.text19') }}</strong>
          </p>
          <p>
            <strong>{{ $t('termsAndConditions.text20') }}</strong>
          </p>
        </div>
      </ds-space>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'default',
  head() {
    return {
      title: this.$t('site.termsAndConditions'),
    }
  },
}
</script>
