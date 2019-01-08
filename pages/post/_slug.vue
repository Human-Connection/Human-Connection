<template>
  <div>
    <ds-flex gutter="small">
      <ds-flex-item>
        <transition
          name="slide-up"
          appear
        >
          <nuxt-child />
        </transition>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '200px' }">
        <ds-menu :routes="routes" />
      </ds-flex-item>
    </ds-flex>
  </div>
</template>

<script>
export default {
  computed: {
    routes() {
      return [
        {
          name: this.$t('common.post', null, 1),
          path: `/post/${this.$route.params.slug}`,
          children: [
            {
              name: this.$t('common.comment', null, 2),
              path: `/post/${this.$route.params.slug}#comments`
            },
            {
              name: this.$t('common.letsTalk'),
              path: `/post/${this.$route.params.slug}#lets-talk`
            },
            {
              name: this.$t('common.versus'),
              path: `/post/${this.$route.params.slug}#versus`
            }
          ]
        },
        {
          name: this.$t('common.moreInfo'),
          path: `/post/${this.$route.params.slug}/more-info`
        },
        {
          name: this.$t('common.takeAction'),
          path: `/post/${this.$route.params.slug}/take-action`
        }
      ]
    }
  }
}
</script>
