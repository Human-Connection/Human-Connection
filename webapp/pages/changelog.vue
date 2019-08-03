<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.changelog') }}</ds-heading>
    </ds-space>

    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.changelog') }}</ds-text>

        <p>
          <strong>{{ $t('changelog.text33') }}</strong>
        </p>
        <br />
        <p>
          <strong>{{ $t('changelog.text32') }}</strong>
        </p>
        <ul>
          <li>{{ $t('changelog.text31') }}</li>
          <li>{{ $t('changelog.text30') }}</li>
          <li>{{ $t('changelog.text29') }}</li>
          <li>{{ $t('changelog.text28') }}</li>
          <li>{{ $t('changelog.text27') }}</li>
          <li>{{ $t('changelog.text26') }}</li>
        </ul>
        <p>
          <strong>{{ $t('changelog.text25') }}</strong>
        </p>
        <ul>
          <li>{{ $t('changelog.text24') }}</li>
          <li>{{ $t('changelog.text23') }}</li>
        </ul>
        <p>
          <strong>{{ $t('changelog.text22') }}</strong>
        </p>
        <ul>
          <li>{{ $t('changelog.text21') }}</li>
          <li>{{ $t('changelog.text20') }}</li>
          <li>{{ $t('changelog.text19') }}</li>
          <li>{{ $t('changelog.text18') }}</li>
          <li>{{ $t('changelog.text17') }}</li>
          <li>{{ $t('changelog.text16') }}</li>
          <li>{{ $t('changelog.text15') }}</li>
        </ul>
        <p>
          <strong>{{ $t('changelog.text14') }}</strong>
        </p>
        <ul>
          <li>{{ $t('changelog.text13') }}</li>
          <li>{{ $t('changelog.text12') }}</li>
          <li>{{ $t('changelog.text11') }}</li>
        </ul>
        <p>
          <strong>{{ $t('changelog.text10') }}</strong>
        </p>
        <ul>
          <li>{{ $t('changelog.text9') }}</li>
          <li>{{ $t('changelog.text8') }}</li>
          <li>{{ $t('changelog.text7') }}</li>
          <li>{{ $t('changelog.text6') }}</li>
          <li>{{ $t('changelog.text5') }}</li>
          <li>{{ $t('changelog.text4') }}</li>
        </ul>
        <p>
          <strong>{{ $t('changelog.text3') }}</strong>
        </p>
        <ul>
          <li>
            {{ $t('changelog.text2') }}
            <a
              class="hc-editor-link-blot"
              href="https://www.youtube.com/watch?v=8j2H0vnQEoQ"
              target="_blank"
            >
              {{ $t('changelog.text1') }}
            </a>
            {{ $t('changelog.text0') }}
          </li>
        </ul>
      </ds-space>
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'default',
  head() {
    return {
      title: this.$t('site.changelog'),
    }
  },
}
</script>
