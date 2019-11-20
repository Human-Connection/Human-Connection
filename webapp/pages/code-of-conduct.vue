<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.code-of-conduct') }}</ds-heading>
      <p>{{ $t('code-of-conduct.subheader') }}</p>
    </ds-space>

    <ds-container>
      <div v-for="section in sections" :key="section">
        <strong>{{ $t(`code-of-conduct.${section}.title`) }}</strong>  <!-- i18n-variable -->
        <p>{{ $t(`code-of-conduct.${section}.description`) }}</p>      <!-- i18n-variable -->
      </div>

      <br />

      <div v-for="section in listSections" :key="section.key">
        <strong>{{ $t(`code-of-conduct.${section.key}.title`) }}</strong>  <!-- i18n-variable -->
<!-- i18n $t(`code-of-conduct.preamble.title`)                -->
<!-- i18n $t(`code-of-conduct.purpose.title`)                 -->
<!-- i18n $t(`code-of-conduct.expected-behaviour.title`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.title`)  -->
<!-- i18n $t(`code-of-conduct.consequences.title`)            -->
        <p>{{ $t(`code-of-conduct.${section.key}.description`) }}</p>  <!-- i18n-variable -->
<!-- i18n $t(`code-of-conduct.preamble.description`)                -->
<!-- i18n $t(`code-of-conduct.purpose.description`)                 -->
<!-- i18n $t(`code-of-conduct.expected-behaviour.description`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.description`)  -->
<!-- i18n $t(`code-of-conduct.consequences.description`)            -->
        <ul>
          <li v-for="i in section.items" :key="i">
            {{ $t(`code-of-conduct.${section.key}.list.${i}`) }}  <!-- i18n-variable -->

<!-- i18n $t(`code-of-conduct.expected-behaviour.list.0`)          -->
<!-- i18n $t(`code-of-conduct.expected-behaviour.list.1`)          -->
<!-- i18n $t(`code-of-conduct.expected-behaviour.list.2`)          -->
<!-- i18n $t(`code-of-conduct.expected-behaviour.list.3`)          -->

<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.0`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.1`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.2`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.3`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.4`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.5`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.6`)      -->
<!-- i18n $t(`code-of-conduct.unacceptable-behaviour.list.7`)      -->

<!-- i18n $t(`code-of-conduct.consequences.list.0`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.1`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.2`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.3`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.4`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.5`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.6`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.7`)                -->
<!-- i18n $t(`code-of-conduct.consequences.list.8`)                -->

          </li>
        </ul>
      </div>

      <p>
        {{ $t('code-of-conduct.get-help') }}
        <a class="hc-editor-link-blot" href="moderation@human-connection.org" target="_blank">
          moderation@human-connection.org
        </a>
      </p>
      <br />
    </ds-container>
  </div>
</template>

<script>
export default {
  layout: 'basic',
  head() {
    return {
      title: this.$t('site.code-of-conduct'),
    }
  },
  data() {
    return {
      sections: ['preamble', 'purpose'],
      listSections: [
        {
          key: 'expected-behaviour',
          items: [...Array(4).keys()],
        },
        {
          key: 'unacceptable-behaviour',
          items: [...Array(8).keys()],
        },
        {
          key: 'consequences',
          items: [...Array(9).keys()],
        },
      ],
    }
  },
}
</script>
