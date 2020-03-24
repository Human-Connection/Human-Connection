<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container class="main-navigation-container" style="padding: 10px 10px;">
        <div>
          <ds-flex class="main-navigation-flex">
            <ds-flex-item :width="{ base: '142px' }">
              <nuxt-link :to="{ name: 'index' }" v-scroll-to="'.main-navigation'">
                <ds-logo />
              </nuxt-link>
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '40%', sm: '40%', md: '40%', lg: '0%' }"
              class="mobile-hamburger-menu"
            >
              <base-button icon="bars" @click="toggleMobileMenuView" circle />
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '45%', sm: '45%', md: '45%', lg: '50%' }"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
              style="flex-shrink: 0; flex-grow: 1;"
              id="nav-search-box"
              v-if="isLoggedIn"
            >
              <search-field />
            </ds-flex-item>
            <ds-flex-item
              v-if="isLoggedIn"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
              style="flex-grow: 0; flex-basis: auto;"
            >
              <client-only>
                <filter-menu v-show="showFilterMenuDropdown" />
              </client-only>
            </ds-flex-item>
            <ds-flex-item
              style="background-color: white; flex-basis: auto;"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <div
                class="main-navigation-right"
                :class="{
                  'desktop-view': !toggleMobileMenu,
                  'hide-mobile-menu': !toggleMobileMenu,
                }"
                style="flex-basis: auto;"
              >
                <locale-switch class="topbar-locale-switch" placement="top" offset="8" />
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
import { mapGetters } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import SearchField from '~/components/features/SearchField/SearchField.vue'
import Modal from '~/components/Modal'
import NotificationMenu from '~/components/NotificationMenu/NotificationMenu'
import seo from '~/mixins/seo'
import FilterMenu from '~/components/FilterMenu/FilterMenu.vue'
import PageFooter from '~/components/PageFooter/PageFooter'
import AvatarMenu from '~/components/AvatarMenu/AvatarMenu'

export default {
  components: {
    LocaleSwitch,
    SearchField,
    Modal,
    NotificationMenu,
    AvatarMenu,
    FilterMenu,
    PageFooter,
  },
  mixins: [seo],
  data() {
    return {
      mobileSearchVisible: false,
      toggleMobileMenu: false,
    }
  },
  computed: {
    ...mapGetters({
      isLoggedIn: 'auth/isLoggedIn',
    }),
    showFilterMenuDropdown() {
      const [firstRoute] = this.$route.matched
      return firstRoute && firstRoute.name === 'index'
    },
  },
  methods: {
    toggleMobileMenuView() {
      this.toggleMobileMenu = !this.toggleMobileMenu
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
  justify-content: flex-end;
}
.main-navigation-right .desktop-view {
  float: right;
}
.ds-flex-item.mobile-hamburger-menu {
  margin-left: auto;
  text-align: right;
}
@media only screen and (min-width: 730px) {
  .mobile-hamburger-menu {
    display: none;
  }
}
@media only screen and (max-width: 730px) {
  #nav-search-box,
  .main-navigation-right {
    margin: 10px 0px;
  }
  .hide-mobile-menu {
    display: none;
  }
}
</style>
