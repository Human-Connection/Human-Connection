<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.code-of-conduct') }}</ds-heading>
    </ds-space>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>{{ $t('site.code-of-conduct') }}</ds-text>
      </ds-space>

      <p>{{ $t('code-of-conduct.text0') }}</p>
      <br />
      <p>
        <strong>{{ $t('code-of-conduct.text1') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text2') }}</p>
      <br />
      <p>{{ $t('code-of-conduct.text3') }}</p>
      <br />
      <p>
        <strong>{{ $t('code-of-conduct.text4') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text5') }}</p>
      <br />
      <p>{{ $t('code-of-conduct.text6') }}</p>
      <br />
      <p>
        <strong>{{ $t('code-of-conduct.text7') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text8') }}</p>
      <ul>
        <li>{{ $t('code-of-conduct.text9') }}</li>
        <li>{{ $t('code-of-conduct.text10') }}</li>
        <li>{{ $t('code-of-conduct.text11') }}</li>
        <li>{{ $t('code-of-conduct.text12') }}</li>
      </ul>
      <p>
        <strong>{{ $t('code-of-conduct.text13') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text14') }}</p>
      <ul>
        <li>{{ $t('code-of-conduct.text15') }}</li>
        <li>{{ $t('code-of-conduct.text16') }}</li>
        <li>{{ $t('code-of-conduct.text17') }}</li>
        <li>{{ $t('code-of-conduct.text18') }}</li>
        <li>{{ $t('code-of-conduct.text19') }}</li>
        <li>{{ $t('code-of-conduct.text20') }}</li>
        <li v-html="$t('code-of-conduct.text21')"></li>
        <li>{{ $t('code-of-conduct.text22') }}</li>
      </ul>
      <p>
        <strong>{{ $t('code-of-conduct.text23') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text24') }}</p>
      <ul>
        <li>{{ $t('code-of-conduct.text25') }}</li>
        <li>{{ $t('code-of-conduct.text26') }}</li>
        <li>{{ $t('code-of-conduct.text27') }}</li>
        <li>{{ $t('code-of-conduct.text28') }}</li>
        <li>{{ $t('code-of-conduct.text29') }}</li>
        <li>{{ $t('code-of-conduct.text30') }}</li>
        <li>{{ $t('code-of-conduct.text31') }}</li>
      </ul>
      <p>{{ $t('code-of-conduct.text32') }}</p>
      <br />
      <p>
        <strong>{{ $t('code-of-conduct.text33') }}</strong>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text34') }}</p>
      <br />
      <p>
        <a class="hc-editor-link-blot" href="moderation@human-connection.org" target="_blank">
          moderation@human-connection.org
        </a>
      </p>
      <br />
      <p>{{ $t('code-of-conduct.text35') }}</p>
    </ds-container>
  </div>
</template>

<script>
export default {
  head() {
    return {
      title: this.$t('site.code-of-conduct'),
    }
  },
}
</script>
