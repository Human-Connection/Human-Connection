<template>
  <div>
    <ds-space>
      <ds-menu :routes="routes" navbar>
      </ds-menu>
    </ds-space>
    <ds-space margin-bottom="xxx-large">
      <ds-menu :routes="routes" navbar inverse>
      </ds-menu>
    </ds-space>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          {
            name: 'Introduction',
            path: '/'
          },
          {
            name: 'Navigation',
            path: '/navigation',
            children: [
              {
                name: 'Menu',
                path: '/navigation/dsmenu'
              },
              {
                name: 'Breadcrumb',
                path: '/navigation/dsbreadcrumb'
              }
            ]
          },
          {
            name: 'Typography',
            path: '/typography'
          },
          {
            name: 'Layout',
            path: '/layout'
          }
        ]
      }
    }
  }
</script>