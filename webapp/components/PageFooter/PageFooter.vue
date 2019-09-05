<template>
  <div id="footer" class="ds-footer">
    <a href="https://human-connection.org" target="_blank" v-html="$t('site.made')"></a>
    &nbsp;-&nbsp;
    <nuxt-link to="/imprint">{{ $t('site.imprint') }}</nuxt-link>
    &nbsp;‑&nbsp;
    <nuxt-link to="/terms-and-conditions">{{ $t('site.termsAndConditions') }}</nuxt-link>
    &nbsp;‑&nbsp;
    <nuxt-link to="/code-of-conduct">{{ $t('site.code-of-conduct') }}</nuxt-link>
    &nbsp;‑&nbsp;
    <nuxt-link to="/data-privacy">{{ $t('site.data-privacy') }}</nuxt-link>
    &nbsp;‑&nbsp;
    <nuxt-link to="/changelog">{{ $t('site.changelog') }}</nuxt-link>
  </div>
</template>
