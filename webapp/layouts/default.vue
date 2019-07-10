<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container class="main-navigation-container" style="padding: 10px 10px;">
        <div>
          <ds-flex class="main-navigation-flex">
            <ds-flex-item :width="{ lg: '5%' }" />
            <ds-flex-item :width="{ base: '80%', sm: '80%', md: '80%', lg: '15%' }">
              <a @click="redirectToRoot">
                <ds-logo />
              </a>
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '20%', sm: '20%', md: '20%', lg: '0%' }"
              class="mobile-hamburger-menu"
            >
              <ds-button icon="bars" @click="toggleMobileMenuView" right />
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '100%', sm: '100%', md: '50%', lg: '45%' }"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <div id="nav-search-box" v-on:click="unfolded" @blur.capture="foldedup">
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
              :width="{ base: '100%', sm: '100%', md: '10%', lg: '10%' }"
              :class="{ 'hide-mobile-menu': !toggleMobileMenu }"
            >
              <no-ssr>
                <filter-posts placement="bottom-end" offset="23" :categories="categories" />
              </no-ssr>
            </ds-flex-item>
            <ds-flex-item
              :width="{ base: '100%', sm: '100%', md: '100%', lg: '20%' }"
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
                <no-ssr>
                  <locale-switch class="topbar-locale-switch" placement="bottom" offset="23" />
                </no-ssr>
                <template v-if="isLoggedIn">
                  <no-ssr>
                    <notification-menu />
                  </no-ssr>
                  <no-ssr>
                    <dropdown class="avatar-menu">
                      <template slot="default" slot-scope="{ toggleMenu }">
                        <a
                          class="avatar-menu-trigger"
                          :href="
                            $router.resolve({
                              name: 'profile-id-slug',
                              params: { id: user.id, slug: user.slug },
                            }).href
                          "
                          @click.prevent="toggleMenu"
                        >
                          <hc-avatar :user="user" />
                          <ds-icon size="xx-small" name="angle-down" />
                        </a>
                      </template>
                      <template slot="popover" slot-scope="{ closeMenu }">
                        <div class="avatar-menu-popover">
                          {{ $t('login.hello') }}
                          <b>{{ userName }}</b>
                          <template v-if="user.role !== 'user'">
                            <ds-text color="softer" size="small" style="margin-bottom: 0">
                              {{ user.role | camelCase }}
                            </ds-text>
                          </template>
                          <hr />
                          <ds-menu :routes="routes" :matcher="matcher">
                            <ds-menu-item
                              slot="menuitem"
                              slot-scope="item"
                              :route="item.route"
                              :parents="item.parents"
                              @click.native="closeMenu(false)"
                            >
                              <ds-icon :name="item.route.icon" />
                              {{ item.route.name }}
                            </ds-menu-item>
                          </ds-menu>
                          <hr />
                          <nuxt-link class="logout-link" :to="{ name: 'logout' }">
                            <ds-icon name="sign-out" />
                            {{ $t('login.logout') }}
                          </nuxt-link>
                        </div>
                      </template>
                    </dropdown>
                  </no-ssr>
                </template>
              </div>
            </ds-flex-item>
          </ds-flex>
        </div>
      </ds-container>
    </div>
    <ds-container style="word-break: break-all">
      <div class="main-container" :width="{ base: '100%', md: '96%' }">
        <nuxt />
      </div>
    </ds-container>
    <div id="footer" class="ds-footer">
      <a href="https://human-connection.org" target="_blank" v-html="$t('site.made')"></a>
      &nbsp;-&nbsp;
      <nuxt-link to="/imprint">{{ $t('site.imprint') }}</nuxt-link>
      &nbsp;‑&nbsp;
      <nuxt-link to="/terms-and-conditions">{{ $t('site.termsAc') }}</nuxt-link>
      &nbsp;‑&nbsp;
      <nuxt-link to="/privacy">{{ $t('site.privacy') }}</nuxt-link>
      &nbsp;‑&nbsp;
      <nuxt-link to="/changelog">{{ $t('site.changelog') }}</nuxt-link>
    </div>
    <div id="overlay" />
    <no-ssr>
      <modal />
    </no-ssr>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import SearchInput from '~/components/SearchInput.vue'
import Modal from '~/components/Modal'
import NotificationMenu from '~/components/notifications/NotificationMenu'
import Dropdown from '~/components/Dropdown'
import HcAvatar from '~/components/Avatar/Avatar.vue'
import seo from '~/mixins/seo'
import FilterPosts from '~/components/FilterPosts/FilterPosts.vue'
import CategoryQuery from '~/graphql/CategoryQuery.js'

export default {
  components: {
    Dropdown,
    LocaleSwitch,
    SearchInput,
    Modal,
    NotificationMenu,
    HcAvatar,
    FilterPosts,
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
      user: 'auth/user',
      isLoggedIn: 'auth/isLoggedIn',
      isModerator: 'auth/isModerator',
      isAdmin: 'auth/isAdmin',
      quickSearchResults: 'search/quickResults',
      quickSearchPending: 'search/quickPending',
    }),
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
    routes() {
      if (!this.user.slug) {
        return []
      }
      let routes = [
        {
          name: this.$t('profile.name'),
          path: `/profile/${this.user.slug}`,
          icon: 'user',
        },
        {
          name: this.$t('settings.name'),
          path: `/settings`,
          icon: 'cogs',
        },
      ]
      if (this.isModerator) {
        routes.push({
          name: this.$t('moderation.name'),
          path: `/moderation`,
          icon: 'balance-scale',
        })
      }
      if (this.isAdmin) {
        routes.push({
          name: this.$t('admin.name'),
          path: `/admin`,
          icon: 'shield',
        })
      }
      return routes
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
      fetchPosts: 'posts/fetchPosts',
    }),
    goToPost(item) {
      this.$nextTick(() => {
        this.$router.push({
          name: 'post-id-slug',
          params: { id: item.id, slug: item.slug },
        })
      })
    },
    matcher(url, route) {
      if (url.indexOf('/profile') === 0) {
        // do only match own profile
        return this.$route.path === url
      }
      return this.$route.path.indexOf(url) === 0
    },
    unfolded: function() {
      document.getElementById('nav-search-box').classList.add('unfolded')
    },
    foldedup: function() {
      document.getElementById('nav-search-box').classList.remove('unfolded')
    },
    toggleMobileMenuView() {
      this.toggleMobileMenu = !this.toggleMobileMenu
    },
    redirectToRoot() {
      this.$router.replace('/')
      this.fetchPosts({ i18n: this.$i18n, filter: {} })
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
<style>
.unfolded {
  position: absolute;
  right: 0px;
  left: 0px;
  z-index: 1;
}
</style>

<style lang="scss">
.topbar-locale-switch {
  display: flex;
  margin-right: $space-xx-small;
  align-self: center;
  display: inline-flex;
}

.main-container {
  padding-top: 6rem;
  padding-botton: 5rem;
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

.avatar-menu-trigger {
  user-select: none;
  display: flex;
  align-items: center;
  padding-left: $space-xx-small;
}

.avatar-menu-popover {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  hr {
    color: $color-neutral-90;
    background-color: $color-neutral-90;
  }

  .logout-link {
    margin-left: -$space-small;
    margin-right: -$space-small;
    margin-top: -$space-xxx-small;
    margin-bottom: -$space-x-small;
    padding: $space-x-small $space-small;
    // subtract menu border with from padding
    padding-left: $space-small - 2;

    color: $text-color-base;

    &:hover {
      color: $text-color-link-active;
    }
  }

  nav {
    margin-left: -$space-small;
    margin-right: -$space-small;
    margin-top: -$space-xx-small;
    margin-bottom: -$space-xx-small;

    a {
      padding-left: 12px;
    }
  }
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

.ds-footer {
  text-align: center;
  position: fixed;
  bottom: 0px;
  z-index: 10;
  background-color: white;
  width: 100%;
  padding: 10px 10px;
}
</style>
