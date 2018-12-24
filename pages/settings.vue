<template>
  <div>
    <ds-heading tag="h1">
      {{ $t('settings.name') }}
    </ds-heading>
    <ds-flex gutter="small">
      <ds-flex-item :width="{ base: '200px' }">
        <ds-menu :routes="routes" />
      </ds-flex-item>
      <ds-flex-item>
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
  computed: {
    routes() {
      return [
        {
          name: this.$t('settings.data.name'),
          path: `/settings`
        },
        {
          name: this.$t('settings.security.name'),
          path: `/settings/security`
        },
        {
          name: this.$t('settings.invites.name'),
          path: `/settings/invites`
        },
        {
          name: this.$t('settings.download.name'),
          path: `/settings/data-download`
        },
        {
          name: this.$t('settings.delete.name'),
          path: `/settings/delete-account`
        },
        {
          name: this.$t('settings.organizations.name'),
          path: `/settings/my-organizations`
        },
        {
          name: this.$t('settings.languages.name'),
          path: `/settings/languages`
        }
      ]
    }
  }
}
</script>
