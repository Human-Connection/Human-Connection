<template>
  <div id="footer" class="ds-footer">
    <a href="https://human-connection.org" target="_blank" v-html="$t('site.made')"></a>
    <span>-</span>
    <a
      href="https://human-connection.org/impressum/"
      target="_blank"
      v-html="$t('site.imprint')"
    ></a>
    <span>-</span>
    <nuxt-link to="/terms-and-conditions">{{ $t('site.termsAndConditions') }}</nuxt-link>
    <span>-</span>
    <nuxt-link to="/code-of-conduct">{{ $t('site.code-of-conduct') }}</nuxt-link>
    <span>-</span>
    <a
      href="https://human-connection.org/datenschutz/"
      target="_blank"
      v-html="$t('site.data-privacy')"
    ></a>
    <span>-</span>
    <nuxt-link to="/changelog">{{ $t('site.changelog') }}</nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
.ds-footer {
  text-align: center;
  position: fixed;
  bottom: 0px;
  z-index: 10;
  background-color: white;
  width: 100%;
  padding: 10px 10px;
  box-shadow: 0px -6px 12px -4px rgba(0, 0, 0, 0.1);
}
span {
  margin-right: 0.2rem;
}
</style>
