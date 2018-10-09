<template>
  <div>
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

<style lang="scss">
@import 'vue-cion-design-system/src/system/tokens/generated/tokens.scss';

// Transition Easing
$easeOut: cubic-bezier(0.19, 1, 0.22, 1);

.layout-enter-active {
  transition: opacity 80ms ease-out;
  transition-delay: 80ms;
}
.layout-leave-active {
  transition: opacity 80ms ease-in;
}
.layout-enter,
.layout-leave-active {
  opacity: 0;
}

// slide up ease
.slide-up-enter-active {
  transition: all 500ms $easeOut;
  transition-delay: 20ms;
  opacity: 1;
  transform: translate3d(0, 0, 0);
}
.slide-up-enter,
.slide-up-leave-active {
  opacity: 0;
  box-shadow: none;
  transform: translate3d(0, 15px, 0);
}

.main-navigation {
  background: #fff;
}

.tags {
  .ds-tag {
    margin-right: $space-xx-small;
  }
}
</style>
