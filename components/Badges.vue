<template>
  <div
    :class="[
      `hc-bades-size-${size}`,
      (badges.length > 1 )? `hc-bades-multiple` : ''
    ]"
    class="hc-badges">
    <img
      v-for="badge in badges"
      :key="badge.key"
      :src="badge.icon"
      class="hc-badge" >
  </div>
</template>

<script>
export default {
  props: {
    badges: {
      type: Array,
      default: () => []
    },
    size: {
      type: String,
      default: 'small',
      validator: value => {
        return value.match(/(small|large)/)
      }
    }
  }
}
</script>

<style lang="scss">
.hc-badges {
  text-align: center;

  .hc-badge {
    display: inline-block;
  }

  &.hc-bades-size-small {
    $size: 28px;
    $offset: $size * -0.2;
    padding-bottom: $size / 2;

    &.hc-bades-multiple {
      margin-top: -$size / 2;
    }
    .hc-badge {
      height: $size;
      &:nth-child(2),
      &:nth-child(4),
      &:nth-child(6) {
        margin-top: $size;
        margin-left: $offset;
        margin-right: $offset;
      }
    }
  }
  &.hc-bades-size-large {
    $size: 36px;
    $offset: $size * -0.2;
    padding-bottom: $size / 2;

    &.hc-bades-multiple {
      margin-top: -$size / 2;
    }
    .hc-badge {
      height: $size;
      &:nth-child(2),
      &:nth-child(4),
      &:nth-child(6) {
        margin-top: $size;
        margin-left: $offset;
        margin-right: $offset;
      }
    }
  }
}
</style>
