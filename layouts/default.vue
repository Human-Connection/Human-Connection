<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container style="padding: .5rem 3rem .2rem;">
        <a
          v-router-link
          href="/">
          <ds-logo />
        </a>
      </ds-container>
    </div>
    <ds-container>
      <div style="padding: 5rem 2rem;">
        <nuxt/>
      </div>
    </ds-container>
  </div>
</template>
