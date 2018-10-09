## Page layouts

You can layout a page in different ways. These are best described by example.

### Sidebar only

```iframe
<template>
  <ds-page ref="page">
    <template slot="brand">
      <ds-logo></ds-logo>
    </template>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="sidebar"
      :routes="routes"></ds-menu>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="drawer"
      :routes="routes"></ds-menu>
    <ds-page-title heading="Sidebar only"></ds-page-title>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>
          This page uses only a sidebar.
        </ds-text>
        <ds-text>
          On mobile devices it will hide the sidebar and show a header with a drawer toggle.
        </ds-text>
      </ds-space>
    </ds-container>
  </ds-page>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          { name: 'Introduction' },
          {
            name: 'Layout',
            children: [
              { name: 'Container' },
              { name: 'Page' },
              { name: 'Page Title' }
            ]
          },
          { name: 'Typography' },
          { name: 'Navigation' }
        ]
      }
    }
  }
</script>
```

### Navbar only

```iframe
<template>
  <ds-page ref="page">
    <template slot="brand">
      <ds-logo></ds-logo>
    </template>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="navbar"
      :routes="routes"
      navbar></ds-menu>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="drawer"
      :routes="routes"></ds-menu>
    <ds-page-title heading="Navbar only"></ds-page-title>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>
          This page uses only a navbar.
        </ds-text>
        <ds-text>
          On mobile devices it will hide the navbar and show a drawer toggle.
        </ds-text>
      </ds-space>
    </ds-container>
  </ds-page>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          { name: 'Introduction' },
          {
            name: 'Layout',
            children: [
              { name: 'Container' },
              { name: 'Page' },
              { name: 'Page Title' }
            ]
          },
          { name: 'Typography' },
          { name: 'Navigation' }
        ]
      }
    }
  }
</script>
```

### Sidebar and Navbar

```iframe
<template>
  <ds-page ref="page">
    <template slot="brand">
      <ds-logo></ds-logo>
    </template>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="navbar"
      :routes="routes"
      navbar></ds-menu>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="sidebar"
      :routes="routes"></ds-menu>
    <ds-menu
      @navigate="$refs.page.closeDrawer()"
      slot="drawer"
      :routes="routes"></ds-menu>
    <ds-page-title heading="Sidebar and Navbar"></ds-page-title>
    <ds-container>
      <ds-space margin-top="large">
        <ds-text>
          This page uses the best of both worlds.
        </ds-text>
        <ds-text>
          On mobile devices it will hide the navbar as well as the sidebar and show a drawer toggle.
        </ds-text>
      </ds-space>
    </ds-container>
  </ds-page>
</template>

<script>
  export default {
    data() {
      return {
        routes: [
          { name: 'Introduction' },
          {
            name: 'Layout',
            children: [
              { name: 'Container' },
              { name: 'Page' },
              { name: 'Page Title' }
            ]
          },
          { name: 'Typography' },
          { name: 'Navigation' }
        ]
      }
    }
  }
</script>
```