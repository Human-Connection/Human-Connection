<template>
  <dropdown>
    <a
      slot="default"
      class="filter-menu"
      href="#"
    >
      <ds-icon
        name="filter"
      />
      Filter
    </a>
  </dropdown>
</template>

<script>
export default {}
</script>

<style>
.filter-menu {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
