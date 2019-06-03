<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container class="main-navigation-container">
        <div class="main-navigation-left">
          <a v-router-link
style="display: inline-flex" href="/">
            <ds-logo />
          </a>
        </div>
        <div class="main-navigation-center hc-navbar-search">
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
        <div class="main-navigation-right">
          <no-ssr>
            <locale-switch class="topbar-locale-switch"
placement="bottom" offset="23" />
          </no-ssr>
          <template v-if="isLoggedIn">
            <no-ssr>
              <notification-menu />
            </no-ssr>
            <no-ssr>
              <dropdown class="avatar-menu">
                <template slot="default"
slot-scope="{ toggleMenu }">
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
                    <ds-avatar :image="user.avatar"
:name="user.name" size="small" />
                    <ds-icon size="xx-small"
name="angle-down" />
                  </a>
                </template>
                <template slot="popover"
slot-scope="{ closeMenu }">
                  <div class="avatar-menu-popover">
                    {{ $t('login.hello') }}
                    <b>{{ userName }}</b>
                    <template v-if="user.role !== 'user'">
                      <ds-text color="softer"
size="small" style="margin-bottom: 0">
                        {{ user.role | camelCase }}
                      </ds-text>
                    </template>
                    <hr >
                    <ds-menu :routes="routes"
:matcher="matcher">
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
                    <hr >
                    <nuxt-link class="logout-link"
:to="{ name: 'logout' }">
                      <ds-icon name="sign-out" />
                      {{ $t('login.logout') }}
                    </nuxt-link>
                  </div>
                </template>
              </dropdown>
            </no-ssr>
          </template>
        </div>
      </ds-container>
    </div>
    <ds-container>
      <div style="padding: 6rem 2rem 5rem;">
        <nuxt />
      </div>
    </ds-container>
    <div id="overlay" />
    <no-ssr>
      <modal />
    </no-ssr>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch'
import SearchInput from '~/components/SearchInput.vue'
import Modal from '~/components/Modal'
import NotificationMenu from '~/components/notifications/NotificationMenu'
import Dropdown from '~/components/Dropdown'
import seo from '~/mixins/seo'

export default {
  components: {
    Dropdown,
    LocaleSwitch,
    SearchInput,
    Modal,
    NotificationMenu,
  },
  mixins: [seo],
  data() {
    return {
      mobileSearchVisible: false,
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
    matcher(url, route) {
      if (url.indexOf('/profile') === 0) {
        // do only match own profile
        return this.$route.path === url
      }
      return this.$route.path.indexOf(url) === 0
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

.main-navigation {
  a {
    color: $text-color-soft;
  }
}

.main-navigation-container {
  padding: $space-x-small $space-large !important;
  width: 100%;
  align-items: center;
  display: flex;
}

.main-navigation-left {
  display: flex;
  flex: 1;
  width: 100%;
  align-items: center;
}

.main-navigation-center {
  display: flex;
  flex: auto;
  width: 100%;
  padding-right: $space-large;
  padding-left: $space-large;
}

.main-navigation-right {
  display: flex;
  flex: 1;
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
</style>
