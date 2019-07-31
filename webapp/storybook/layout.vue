<template>
  <ds-container class="container">
    <slot />
  </ds-container>
</template>

<style lang="scss">
@import '../node_modules/@human-connection/styleguide/dist/system.css';
@import '~/assets/styles/main.scss';

.container {
  padding: 5rem;
}
</style>
