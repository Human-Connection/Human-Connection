<template>
  <svg viewBox="0 0 50 50" class="loading-spinner">
    <circle cx="25" cy="25" r="20" class="circle" />
  </svg>
</template>

<script>
export default {
  name: 'LoadingSpinner',
}
</script>

<style lang="scss">
.loading-spinner {
  height: $size-button-base;
  overflow: hidden;
  stroke: currentColor;
  animation: rotate 16s linear infinite;

  > .circle {
    fill: none;
    stroke-width: 5;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

@keyframes rotate {
  100% {
    transform: rotate(2160deg);
  }
}
</style>
