<template>
  <div>
    <ds-heading tag="h1">
      Settings
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
          name: 'Your Data',
          path: `/settings`
        },
        {
          name: 'Password',
          path: `/settings/password`
        },
        {
          name: 'Invites',
          path: `/settings/invites`
        },
        {
          name: 'Data Download',
          path: `/settings/data-download`
        },
        {
          name: 'Delete Account',
          path: `/settings/delete-account`
        },
        {
          name: 'My Organizations',
          path: `/settings/my-organizations`
        },
        {
          name: 'Settings',
          path: `/settings/settings`
        }
      ]
    }
  }
}
</script>
