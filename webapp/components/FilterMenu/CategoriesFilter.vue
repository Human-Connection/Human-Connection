<template>
  <section class="categories-filter">
    <h4 class="title">{{ $t('filter-menu.categories') }}</h4>
    <labeled-button
      :filled="!filteredCategoryIds.length"
      :label="$t('filter-menu.all')"
      icon="check"
      @click="resetCategories"
    />
    <div class="divider" />
    <ul class="categories-list">
      <li v-for="category in categories" :key="category.id" class="menu-item">
        <labeled-button
          :icon="category.icon"
          :filled="filteredCategoryIds.includes(category.id)"
          :label="$t(`contribution.category.name.${category.slug}`)"
          @click="toggleCategory(category.id)"
        />
      </li>
    </ul>
  </section>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import CategoryQuery from '~/graphql/CategoryQuery.js'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    LabeledButton,
  },
  data() {
    return {
      categories: [],
    }
  },
  computed: {
    ...mapGetters({
      filteredCategoryIds: 'posts/filteredCategoryIds',
    }),
  },
  methods: {
    ...mapMutations({
      resetCategories: 'posts/RESET_CATEGORIES',
      toggleCategory: 'posts/TOGGLE_CATEGORY',
    }),
  },
  apollo: {
    Category: {
      query() {
        return CategoryQuery()
      },
      update({ Category }) {
        if (!Category) return []
        this.categories = Category
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.categories-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-small;

  > .title {
    width: 100%;
  }

  > .labeled-button {
    margin-top: $space-small;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: $space-base;
  }

  > .categories-list {
    display: flex;
    flex-wrap: wrap;
    flex-basis: 80%;
    flex-grow: 1;

    > .menu-item {
      width: 12.5%;
      margin: $space-small 0;
    }
  }

  @media only screen and (max-width: 800px) {
    .categories-list > .menu-item {
      width: 16%;
    }
  }

  @media only screen and (max-width: 630px) {
    flex-direction: column;

    > .categories-list > .menu-item {
      width: 25%;
      margin: $space-x-small 0;
    }

    > .title {
      text-align: center;
    }

    > .divider {
      border-top: $border-size-base solid $border-color-soft;
      margin: $space-small;
    }
  }

  @media only screen and (max-width: 440px) {
    .categories-list > .menu-item {
      width: 50%;
    }
  }
}
</style>
