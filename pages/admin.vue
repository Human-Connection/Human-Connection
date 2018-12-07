<template>
  <div>
    <ds-heading tag="h1">
      Administartion
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
  data() {
    return {
      routes: [
        {
          name: 'Dashboard',
          path: `/admin`
        },
        {
          name: 'Users',
          path: `/admin/users`
        },
        {
          name: 'Organizations',
          path: `/admin/organizations`
        },
        {
          name: 'Pages',
          path: `/admin/pages`
        },
        {
          name: 'Notifications',
          path: `/admin/notifications`
        },
        {
          name: 'Categories',
          path: `/admin/categories`
        },
        {
          name: 'Tags',
          path: `/admin/tags`
        },
        {
          name: 'Settings',
          path: `/admin/settings`
        }
      ]
    }
  }
}
</script>
