<template>
  <base-card class="card-with-columns">
    <section class="column --left">
      <slot name="left" />
    </section>
    <section class="column --right">
      <slot name="right" />
    </section>
  </base-card>
</template>

<script>
export default {}
</script>

<style lang="scss">
.card-with-columns {
  display: flex;

  > .column {
    flex-basis: 50%;
    display: flex;
    flex-direction: column;
  }
}
</style>
