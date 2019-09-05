<template>
  <div class="layout-blank">
    <div class="main-navigation">
      <ds-container width="x-large" class="main-navigation-container" style="padding: 10px 10px;">
        <ds-flex class="main-navigation-flex" centered>
          <ds-flex-item width="5.5%" />
          <ds-flex-item style="flex-grow:1;" width="20%">
            <a @click="redirectToRoot">
              <ds-logo />
            </a>
          </ds-flex-item>
          <ds-flex-item width="20%" style="flex-grow:0;">
            <client-only>
              <locale-switch class="topbar-locale-switch" placement="top" offset="16" />
            </client-only>
          </ds-flex-item>
        </ds-flex>
      </ds-container>
    </div>
    <ds-container>
      <div style="padding: 5rem 2rem;">
        <nuxt />
      </div>
    </ds-container>
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
    <div id="overlay" />
  </div>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import seo from '~/mixins/seo'

export default {
  components: {
    LocaleSwitch,
  },
  mixins: [seo],
  methods: {
    redirectToRoot() {
      this.$router.replace('/')
    },
  },
}
</script>
