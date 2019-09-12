<template>
  <div class="layout-blank">
    <ds-container>
      <div style="padding: 5rem 2rem;">
        <nuxt />
      </div>
    </ds-container>
    <page-footer />
    <div id="overlay" />
  </div>
</template>

<script>
import seo from '~/mixins/seo'
import PageFooter from '~/components/PageFooter/PageFooter'

export default {
  components: {
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
