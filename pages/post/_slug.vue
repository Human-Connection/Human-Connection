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
  data() {
    return {
      routes: [
        {
          name: 'Post',
          path: `/post/${this.$route.params.slug}`,
          children: [
            {
              name: 'Kommentare',
              path: `/post/${this.$route.params.slug}#comments`
            },
            {
              name: 'Miteinander reden',
              path: `/post/${this.$route.params.slug}#lets-talk`
            },
            {
              name: 'Versus',
              path: `/post/${this.$route.params.slug}#versus`
            }
          ]
        },
        {
          name: 'Mehr Info',
          path: `/post/${this.$route.params.slug}/more-info`
        },
        {
          name: 'Aktiv werden',
          path: `/post/${this.$route.params.slug}/take-action`
        }
      ]
    }
  }
}
</script>
