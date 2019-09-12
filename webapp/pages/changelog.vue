<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.changelog') }}</ds-heading>
    </ds-space>

    <ds-container>
      <strong>
        {{ Date.parse('2019-03') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>{{ $t('changelog.24') }}</li>
        <li>{{ $t('changelog.23') }}</li>
        <li>{{ $t('changelog.22') }}</li>
        <li>{{ $t('changelog.21') }}</li>
        <li>{{ $t('changelog.20') }}</li>
      </ul>
      <strong>
        {{ Date.parse('2019-02') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>{{ $t('changelog.19') }}</li>
        <li>{{ $t('changelog.18') }}</li>
        <li>{{ $t('changelog.17') }}</li>
      </ul>
      <strong>
        {{ Date.parse('2019-01') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>{{ $t('changelog.16') }}</li>
        <li>{{ $t('changelog.15') }}</li>
        <li>{{ $t('changelog.14') }}</li>
        <li>{{ $t('changelog.13') }}</li>
        <li>{{ $t('changelog.12') }}</li>
        <li>{{ $t('changelog.11') }}</li>
        <li>{{ $t('changelog.10') }}</li>
      </ul>
      <strong>
        {{ Date.parse('2018-12') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>{{ $t('changelog.9') }}</li>
        <li>{{ $t('changelog.8') }}</li>
        <li>{{ $t('changelog.7') }}</li>
      </ul>
      <strong>
        {{ Date.parse('2018-11') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>{{ $t('changelog.6') }}</li>
        <li>{{ $t('changelog.5') }}</li>
        <li>{{ $t('changelog.4') }}</li>
        <li>{{ $t('changelog.3') }}</li>
        <li>{{ $t('changelog.2') }}</li>
        <li>{{ $t('changelog.1') }}</li>
      </ul>
      <strong>
        {{ Date.parse('2018-10') | date('MMMM yyyy') }}
      </strong>
      <ul>
        <li>
          {{ $t('changelog.0') }}
          <br />
          <a
            class="hc-editor-link-blot"
            href="https://www.youtube.com/watch?v=8j2H0vnQEoQ"
            target="_blank"
          >
            https://www.youtube.com/watch?v=8j2H0vnQEoQ
          </a>
        </li>
      </ul>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'basic',
  head() {
    return {
      title: this.$t('site.changelog'),
    }
  },
}
</script>
