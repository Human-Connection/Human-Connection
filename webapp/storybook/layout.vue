<template>
  <div class="container">
    <slot />
  </div>
</template>

<style lang="scss">
@import '../node_modules/@human-connection/styleguide/dist/system.css';
@import '~/assets/styles/main.scss';

.container {
  padding: 5rem;
  max-width: 1200px;
  margin: 0 auto;
}
</style>
