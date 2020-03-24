<template>
  <section class="filter-menu-section">
    <h3 v-if="title" class="title">{{ title }}</h3>
    <aside class="sidebar">
      <slot name="sidebar" />
    </aside>
    <div v-if="divider" class="divider" />
    <ul class="filter-list">
      <slot name="filter-list" />
    </ul>
  </section>
</template>

<script>
export default {
  props: {
    divider: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
    },
  },
}
</script>

<style lang="scss">
.filter-menu-section {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-small;

  > .title {
    width: 100%;
    margin-bottom: $space-small;
    font-size: $font-size-base;
  }

  > .sidebar {
    flex-basis: 12%;
    max-width: $size-width-filter-sidebar;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: $space-small;
    margin-left: 0;
  }

  > .filter-list {
    display: flex;
    flex-wrap: wrap;
    flex-basis: 80%;
    flex-grow: 1;

    > .item {
      width: 12.5%;
      padding: 0 $space-x-small;
      margin-bottom: $space-small;
      text-align: center;

      @media only screen and (max-width: 800px) {
        width: 16%;
      }

      @media only screen and (max-width: 630px) {
        width: 25%;
      }

      @media only screen and (max-width: 440px) {
        width: 50%;
      }
    }
  }

  @media only screen and (max-width: 630px) {
    flex-direction: column;

    > .title {
      text-align: center;
    }

    > .sidebar {
      max-width: none;
    }

    > .divider {
      border-top: $border-size-base solid $border-color-soft;
      margin: $space-small;
    }
  }
}
</style>
