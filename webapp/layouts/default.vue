<template>
  <div class="layout-default">
    <page-header />
    <ds-container>
      <div class="main-container">
        <nuxt />
      </div>
    </ds-container>
    <page-footer />
    <div id="overlay" />
    <client-only>
      <modal />
    </client-only>
  </div>
</template>

<script>
import seo from '~/mixins/seo'
import Modal from '~/components/Modal'
import PageFooter from '~/components/PageFooter/PageFooter'
import PageHeader from '~/components/PageHeader'

export default {
  components: {
    Modal,
    PageFooter,
    PageHeader,
  },
  mixins: [seo],
}
</script>

<style lang="scss">
.main-container {
  padding-top: 6rem;
  padding-bottom: 5rem;
}
</style>
