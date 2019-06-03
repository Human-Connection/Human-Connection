<template>
  <div>
    <ds-heading tag="h1">
      {{ $t('settings.name') }}
    </ds-heading>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '100%', md: '200px' }">
        <ds-menu :routes="routes"
:is-exact="() => true" />
      </ds-flex-item>
      <ds-flex-item :width="{ base: '100%', md: 1 }">
        <transition name="slide-up"
appear>
          <nuxt-child />
        </transition>
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
          name: this.$t('settings.data.name'),
          path: `/settings`,
        },
        {
          name: this.$t('settings.security.name'),
          path: `/settings/security`,
        },
        {
          name: this.$t('settings.social-media.name'),
          path: `/settings/my-social-media`,
        },
        // TODO implement
        /* {
          name: this.$t('settings.invites.name'),
          path: `/settings/invites`
        }, */
        // TODO implement
        /* {
          name: this.$t('settings.download.name'),
          path: `/settings/data-download`
        }, */
        // TODO implement
        /* {
          name: this.$t('settings.delete.name'),
          path: `/settings/delete-account`
        }, */
        // TODO implement
        /* {
          name: this.$t('settings.organizations.name'),
          path: `/settings/my-organizations`
        }, */
        // TODO implement
        /* {
          name: this.$t('settings.languages.name'),
          path: `/settings/languages`
        },
        } */
      ]
    },
  },
}
</script>
