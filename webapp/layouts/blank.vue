<template>
  <div class="layout-blank">
    <ds-container>
      <div style="padding: 5rem 2rem;">
        <nuxt />
      </div>
    </ds-container>
    <div id="overlay" />
  </div>
</template>

<script>
import seo from '~/components/_mixins/seo'

export default {
  mixins: [seo]
}
</script>
