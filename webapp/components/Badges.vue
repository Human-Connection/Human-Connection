<template>
  <div
    :class="[
      (badges.length === 2) && 'hc-badges-dual'
    ]"
    class="hc-badges"
  >
    <div
      v-for="badge in badges"
      :key="badge.key"
      class="hc-badge-container"
    >
      <hc-image
        :title="badge.key"
        :imageProps="imageProps(badge.icon)"
        class="hc-badge"
      />
    </div>
  </div>
</template>

<script>
import HcImage from './Image'
export default {
  components: {
    HcImage
  },
  props: {
    badges: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    imageProps(icon) {
      return { src: icon}
    }
  }
}
</script>

<style lang="scss">
.hc-badges {
  text-align: center;
  position: relative;

  .hc-badge-container {
    display: inline-block;
    position: unset;
    overflow: hidden;
    vertical-align: middle;
  }

  .hc-badge {
    display: block;
    width: 100%;
  }

  $size: 30px;
  $offset: $size * -0.2;

  &.hc-badges-dual {
    padding-top: $size / 2 - 2;
  }

  .hc-badge-container {
    width: $size;
    height: 26px;
    margin-left: -1px;

    &:nth-child(3n - 1) {
      margin-top: -$size - $offset - 3;
      margin-left: -$size * 0.33 - $offset - 2;
    }
    &:nth-child(3n + 0) {
      margin-top: $size + $offset + 3;
      margin-left: -$size;
    }
    &:nth-child(3n + 1) {
      margin-left: -6px;
    }
    &:first-child {
      margin-left: -$size / 3;
    }
    &:last-child {
      margin-right: -$size / 3;
    }
  }
}
</style>
