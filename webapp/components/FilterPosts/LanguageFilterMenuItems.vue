<template>
  <ds-space margin-top="large">
    <ds-flex id="filter-posts-header">
      <ds-heading tag="h4">{{ $t('filter-posts.language.header') }}</ds-heading>
      <ds-space margin-bottom="large" />
    </ds-flex>
    <ds-flex :gutter="{ lg: 'small' }">
      <ds-flex-item
        :width="{ base: '100%', sm: '100%', md: '100%', lg: '5%' }"
        class="language-menu-item"
      >
        <ds-flex>
          <ds-flex-item width="10%" />
          <ds-flex-item width="100%">
            <ds-button
              icon="check"
              @click.stop.prevent="resetLanguages"
              :primary="!filteredLanguageCodes.length"
            />
            <ds-flex-item>
              <label class="language-labels">{{ $t('filter-posts.language.all') }}</label>
            </ds-flex-item>
            <ds-space />
          </ds-flex-item>
        </ds-flex>
      </ds-flex-item>
      <ds-flex-item :width="{ base: '0%', sm: '0%', md: '0%', lg: '4%' }" />
      <ds-flex-item
        :width="{ base: '0%', sm: '0%', md: '0%', lg: '3%' }"
        id="languages-menu-divider"
      />
      <ds-flex v-for="language in locales" :key="language.code" class="languages-menu">
        <ds-flex class="languages-menu">
          <ds-flex-item width="100%" class="language-menu-item">
            <ds-button
              class="language-buttons"
              :primary="filteredLanguageCodes.includes(language.code)"
              @click.stop.prevent="toggleLanguage(language.code)"
            >
              {{ language.code.toUpperCase() }}
            </ds-button>
            <ds-space margin-bottom="small" />
          </ds-flex-item>
          <ds-flex>
            <ds-flex-item class="language-menu-item">
              <label class="language-labels">
                {{ language.name }}
              </label>
            </ds-flex-item>
            <ds-space margin-bottom="xx-large" />
          </ds-flex>
        </ds-flex>
      </ds-flex>
    </ds-flex>
  </ds-space>
</template>
<script>
import locales from '~/locales'
import orderBy from 'lodash/orderBy'
import { mapGetters, mapMutations } from 'vuex'

export default {
  props: {
    chunk: { type: Array, default: () => [] },
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
.language-menu-item {
  text-align: center;
}

.languages-menu {
  justify-content: center;
}

.language-labels,
.follow-label {
  font-size: $font-size-small;
}

@media only screen and (min-width: 960px) {
  #languages-menu-divider {
    border-left: 1px solid $border-color-soft;
    margin: 9px 0px 40px 0px;
  }
}
</style>
