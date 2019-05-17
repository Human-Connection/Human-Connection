<template>
  <div class="ribbon">
    <small>{{ text }}</small>
  </div>
</template>

<script>
export default {
  name: 'HcRibbon',
  props: {
    text: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped lang="scss">
.ribbon {
  $card-shadow: 0px 12px 26px -4px rgba(0, 0, 0, 0.1);
  position: absolute;
  font-size: 0.9em;
  font-weight: bold;
  padding: 6px 6px;
  color: #fff;
  background-color: $background-color-secondary-active;
  right: -8px;
  //top: -5px;
  float: right;
  border-radius: 2px 0 0 2px;
  box-shadow: $card-shadow;
  z-index: 11;
  // border:           1px solid #ccc;
  &:before {
    content: ' ';
    position: absolute;
    width: 0;
    height: 0;
    right: 0;
    bottom: -6px;
    border-width: 3px 4px 3px 3px;
    border-style: solid;
    border-color: $background-color-secondary transparent transparent
      $background-color-secondary;
  }
}
</style>
