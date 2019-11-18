<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container class="main-navigation-container" style="padding: 10px 10px;">
        <div>
          <ds-flex class="main-navigation-flex">
            <ds-flex-item :width="{ lg: '3.5%' }" />
            <ds-flex-item :width="{ base: '80%', sm: '80%', md: '80%', lg: '15%' }">
              <nuxt-link :to="{ name: 'index' }" v-scroll-to="'.main-navigation'">
                <ds-logo />
              </nuxt-link>
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '20%', sm: '20%', md: '20%', lg: '0%' }"
              class="mobile-hamburger-menu"
            >
              <ds-button icon="bars" @click="toggleMobileMenuView" right />
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '85%', sm: '85%', md: '50%', lg: '50%' }"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <div id="nav-search-box" v-if="isLoggedIn">
                <search-input
                  id="nav-search"
                  :delay="300"
                  :pending="quickSearchPending"
                  :results="quickSearchResults"
                  @clear="quickSearchClear"
                  @search="value => quickSearch({ value })"
                  @select="goToPost"
                />
              </div>
            </ds-flex-item>
            <ds-flex-item
              v-if="isLoggedIn"
              :width="{ base: '15%', sm: '15%', md: '10%', lg: '10%' }"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <client-only>
                <filter-posts
                  v-show="showFilterPostsDropdown"
                  placement="top-start"
                  offset="8"
                  :categories="categories"
                />
              </client-only>
            </ds-flex-item>
            <ds-flex-item :width="{ base: '100%', sm: '100%', md: '10%', lg: '2%' }" />
            <ds-flex-item
              :width="{ base: '100%', sm: '100%', md: '100%', lg: '13%' }"
              style="background-color:white"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <div
                class="main-navigation-right"
                :class="{
                  'desktop-view': !toggleMobileMenu,
                  'hide-mobile-menu': !toggleMobileMenu,
                }"
              >
                <client-only>
                  <locale-switch class="topbar-locale-switch" placement="top" offset="8" />
                </client-only>
                <template v-if="isLoggedIn">
                  <client-only>
                    <notification-menu placement="top" />
                  </client-only>
                  <client-only>
                    <avatar-menu placement="top" />
                  </client-only>
                </template>
              </div>
            </ds-flex-item>
          </ds-flex>
        </div>
      </ds-container>
    </div>
    <ds-container>
      <div class="main-container">
        <nuxt />
      </div>
    </ds-container>
    <page-footer />
    <div id="overlay" />
    <client-only>
      <modal />
    </client-only>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import SearchInput from '~/components/SearchInput.vue'
import Modal from '~/components/Modal'
import NotificationMenu from '~/components/NotificationMenu/NotificationMenu'
import seo from '~/mixins/seo'
import FilterPosts from '~/components/FilterPosts/FilterPosts.vue'
import CategoryQuery from '~/graphql/CategoryQuery.js'
import PageFooter from '~/components/PageFooter/PageFooter'
import AvatarMenu from '~/components/AvatarMenu/AvatarMenu'

export default {
  components: {
    LocaleSwitch,
    SearchInput,
    Modal,
    NotificationMenu,
    AvatarMenu,
    FilterPosts,
    PageFooter,
  },
  mixins: [seo],
  data() {
    return {
      mobileSearchVisible: false,
      toggleMobileMenu: false,
      categories: [],
    }
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
      quickSearchResults: 'search/quickResults',
      quickSearchPending: 'search/quickPending',
    }),
    showFilterPostsDropdown() {
      const [firstRoute] = this.$route.matched
      return firstRoute && firstRoute.name === 'index'
    },
  },
  watch: {
    Category(category) {
      this.categories = category || []
    },
  },
  methods: {
    ...mapActions({
      quickSearchClear: 'search/quickClear',
      quickSearch: 'search/quickSearch',
    }),
    goToPost(item) {
      this.$nextTick(() => {
        this.$router.push({
          name: 'post-id-slug',
          params: { id: item.id, slug: item.slug },
        })
      })
    },
    toggleMobileMenuView() {
      this.toggleMobileMenu = !this.toggleMobileMenu
    },
  },
  apollo: {
    Category: {
      query() {
        return CategoryQuery()
      },
      fetchPolicy: 'cache-and-network',
    },
  },
}
</script>

<style lang="scss">
.topbar-locale-switch {
  display: flex;
  margin-right: $space-xx-small;
  align-self: center;
  display: inline-flex;
}
.main-container {
  padding-top: 6rem;
  padding-bottom: 5rem;
}

.main-navigation-flex {
  align-items: center;
}

.main-navigation {
  a {
    color: $text-color-soft;
  }
}
.main-navigation-right {
  display: flex;
  flex: 1;
}
.main-navigation-right .desktop-view {
  float: right;
}
@media only screen and (min-width: 960px) {
  .mobile-hamburger-menu {
    display: none;
  }
}
@media only screen and (max-width: 960px) {
  #nav-search-box,
  .main-navigation-right {
    margin: 10px 0px;
  }
  .hide-mobile-menu {
    display: none;
  }
}
</style>
