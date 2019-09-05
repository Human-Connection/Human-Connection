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
    <page-footer></page-footer>
    <div id="overlay" />
  </div>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import seo from '~/mixins/seo'
import PageFooter from '~/components/PageFooter/PageFooter'

export default {
  components: {
    LocaleSwitch,
    PageFooter,
  },
  mixins: [seo],
  methods: {
    redirectToRoot() {
      this.$router.replace('/')
    },
  },
}
</script>
