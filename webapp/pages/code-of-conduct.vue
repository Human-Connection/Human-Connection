<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.code-of-conduct') }}</ds-heading>
      <p>{{ $t('code-of-conduct.subheader') }}</p>
    </ds-space>

    <ds-container>
      <div v-for="section in sections" :key="section">
        <strong>{{ $t(`code-of-conduct.${section}.title`) }}</strong>
        <p>{{ $t(`code-of-conduct.${section}.description`) }}</p>
      </div>

      <br />

      <div v-for="section in listSections" :key="section.key">
        <strong>{{ $t(`code-of-conduct.${section.key}.title`) }}</strong>
        <p>{{ $t(`code-of-conduct.${section.key}.description`) }}</p>
        <ul>
          <li v-for="i in section.items" :key="i">
            {{ $t(`code-of-conduct.${section.key}.list.${i}`) }}
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
