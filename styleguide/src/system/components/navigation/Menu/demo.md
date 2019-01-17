## Basic usage

Display an array of route objects.
```
<template>
  <ds-flex gutter="base">
    <ds-flex-item>
      <ds-menu :routes="routes">
      </ds-menu>
    </ds-flex-item>
    <ds-flex-item>
      <ds-menu :routes="routes" inverse>
      </ds-menu>
    </ds-flex-item>
  </ds-flex>
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
```

## Navbar

Display the menu as a navbar. A navbar's height depends on it's nearest parent with a fixed height.
```
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
```

## Custom url parser

By default the url is equal to a route's path. If no path is available the url is constructed from the route's parents names and the route's name.

You can provide a custom url parser function. It takes the route as the first argument, it's parents as the second and returns a string or anything that [router-link's to prop](https://router.vuejs.org/api/#to) can handle.

When returning an object it might be necessary to also provide a custom is-exact function like in the example below.

```
<template>
  <ds-menu
    :routes="routes"
    :url-parser="urlParser"
    :is-exact="isExact"></ds-menu>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          {
            name: 'Introduction'
          },
          {
            name: 'Navigation',
            children: [
              {
                name: 'DsMenu'
              },
              {
                name: 'DsBreadcrumb'
              }
            ]
          },
          {
            name: 'Typography'
          },
          {
            name: 'Layout'
          }
        ]
      }
    },
    methods: {
      urlParser(route) {
        return {
          name: route.name
        }
      },
      isExact(url) {
        return url.name === 'Introduction'
      }
    }
  }
</script>
```

## Custom name parser

You can customize the menu item's name by providing a name parser function.

```
<template>
  <ds-menu
    :routes="routes"
    :name-parser="nameParser"></ds-menu>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          {
            name: 'Introduction'
          },
          {
            name: 'Typography'
          },
          {
            name: 'Layout'
          }
        ]
      }
    },
    methods: {
      nameParser(route) {
        return `My ${route.name}`
      }
    }
  }
</script>
```

## Customize menu items

You can customize top level menu items using slots. The slot name is equal to the routes name.

If you want to keep the sub menu for this menu item, be sure to use the `ds-menu-item` component and pass down the `route` and `parents` prop.

```
<template>
  <ds-menu :routes="routes">
    <ds-menu-item
      @click="handleClick"
      slot="menuitem"
      slot-scope="item"
      :route="item.route"
      :parents="item.parents">
      Custom {{ item.route.name }}
    </ds-menu-item>
  </ds-menu>
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
    },
    methods: {
      handleClick(event, route) {
        event.preventDefault()
        alert(`you clicked on ${route.name}`)
      }
    }
  }
</script>
```