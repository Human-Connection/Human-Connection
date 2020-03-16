<template>
  <section class="language-filter">
    <h4 class="title">{{ $t('filter-menu.languages') }}</h4>
    <labeled-button
      :filled="!filteredLanguageCodes.length"
      :label="$t('filter-menu.all')"
      icon="check"
      @click="resetLanguages"
    />
    <div class="divider" />
    <ul class="languages-list">
      <li v-for="language in locales" :key="language.code" class="menu-item">
        <base-button
          :filled="filteredLanguageCodes.includes(language.code)"
          circle
          @click="toggleLanguage(language.code)"
        >
          {{ language.code.toUpperCase() }}
        </base-button>
      </li>
    </ul>
  </section>
</template>
<script>
import locales from '~/locales'
import orderBy from 'lodash/orderBy'
import { mapGetters, mapMutations } from 'vuex'
import LabeledButton from '~/components/_new/generic/LabeledButton/LabeledButton'

export default {
  components: {
    LabeledButton,
  },
  computed: {
    ...mapGetters({
      filteredLanguageCodes: 'posts/filteredLanguageCodes',
    }),
  },
  methods: {
    ...mapMutations({
      resetLanguages: 'posts/RESET_LANGUAGES',
      toggleLanguage: 'posts/TOGGLE_LANGUAGE',
    }),
  },
  data() {
    return {
      locales: orderBy(locales, 'name'),
    }
  },
}
</script>
<style lang="scss">
.language-filter {
  display: flex;
  flex-wrap: wrap;
  margin-top: $space-small;

  > .title {
    width: 100%;
    margin: $space-small 0;

  }

  > .labeled-button {
    margin-top: $space-small;
  }

  > .divider {
    border-left: $border-size-base solid $border-color-soft;
    margin: $space-x-small $space-base;
  }

  > .languages-list {
    display: flex;
    flex-wrap: wrap;
    flex-basis: 80%;
    flex-grow: 1;

    > .menu-item {
      width: 11%;
      display: flex;
      justify-content: center;
      margin: $space-small 0;
    }
  }
  @media only screen and (max-width: 630px) {
    width: 100%;

    > .title {
      text-align: center;
    }

    .labeled-button {
      width: 100%;
      margin: $space-x-small 0;
    }

    > .divider {
      width: 100%;
      margin: $space-small;
      border-top: $border-size-base solid $border-color-soft;
    }
  }
}

</style>
