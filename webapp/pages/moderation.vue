<template>
  <div>
    <ds-heading tag="h1">
      {{ $t('moderation.name') }}
    </ds-heading>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', md: '200px' }">
        <ds-menu :routes="routes" />
      </ds-flex-item>
      <ds-flex-item :width="{ base: '100%', md: 1 }">
        <transition
          name="slide-up"
          appear
        >
          <nuxt-child />
        </transition>
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
export default {
  middleware: ['isModerator'],
  computed: {
    routes() {
      return [
        {
          name: this.$t('moderation.reports.name'),
          path: `/moderation`,
        },
      ]
    },
  },
}
</script>
