<template>
  <div class="labeled-button">
    <base-button circle :icon="icon" :filled="filled" @click="(event) => $emit('click', event)" />
    <label class="label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    filled: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
}
</script>

<style lang="scss">
.labeled-button {
  display: flex;
  flex-direction: column;
  align-items: center;

  > .label {
    margin-top: $space-x-small;
    font-size: $font-size-small;
    text-align: center;
  }
}
</style>
