<template>
  <div class="layout-blank">
    <div class="main-navigation">
      <ds-container class="main-navigation-container" style="padding: 10px 10px;">
        <div>
          <ds-flex class="main-navigation-flex">
            <ds-flex-item :width="{ lg: '3.5%' }" />
            <ds-flex-item :width="{ base: '80%', sm: '80%', md: '80%', lg: '15%' }">
              <a @click="redirectToRoot">
                <ds-logo />
              </a>
            </ds-flex-item>
            <no-ssr>
              <locale-switch class="blank-locale-switch" offset="5" />
            </no-ssr>
          </ds-flex>
        </div>
      </ds-container>
    </div>
    <ds-container style="word-break: break-all">
      <div class="main-container" :width="{ base: '100%', md: '96%' }">
        <nuxt />
      </div>
    </ds-container>
    <div id="footer" class="ds-footer">
      <a href="https://human-connection.org" target="_blank" v-html="$t('site.made')"></a>
      &nbsp;-&nbsp;
      <nuxt-link to="/imprint">{{ $t('site.imprint') }}</nuxt-link>
      &nbsp;-&nbsp;
      <nuxt-link to="/terms-and-conditions">{{ $t('site.termsAndConditions') }}</nuxt-link>
      &nbsp;-&nbsp;
      <nuxt-link to="/data-privacy">{{ $t('site.data-privacy') }}</nuxt-link>
      &nbsp;-&nbsp;
      <nuxt-link to="/changelog">{{ $t('site.changelog') }}</nuxt-link>
    </div>
    <div id="overlay" />
  </div>
</template>

<script>
import seo from '~/mixins/seo'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
export default {
  mixins: [seo],
  components: {
    LocaleSwitch,
  },
  methods: {
    redirectToRoot() {
      this.$router.replace('/')
    },
  },
}
</script>
<style>
.ds-footer {
  text-align: center;
  position: fixed;
  bottom: 0px;
  z-index: 10;
  background-color: white;
  width: 100%;
  padding: 10px 10px;
}
.blank-locale-switch {
  position: absolute;
  right: 9%;
}
</style>
