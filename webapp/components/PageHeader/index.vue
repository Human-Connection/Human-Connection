<template>
  <header class="page-header">
    <div class="page-header__content">
      <nuxt-link :to="{ name: 'index' }">
        <ds-logo />
      </nuxt-link>
      <search-input
        id="nav-search"
        :delay="300"
        :pending="quickSearchPending"
        :results="quickSearchResults"
        @clear="quickSearchClear"
        @search="value => quickSearch({ value })"
        @select="goToPost"
      />
      <filter-posts
        v-show="showFilterPostsDropdown"
        placement="top-start"
        offset="8"
        :categories="categories"
      />
      <locale-switch class="topbar-locale-switch" placement="top" offset="8" />
      <client-only>
        <notification-menu placement="top" />
      </client-only>
      <dropdown class="avatar-menu" offset="8">
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
            <b>{{ user.name || this.$t('profile.userAnonym') }}</b>
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
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import CategoryQuery from '~/graphql/CategoryQuery.js'
import Dropdown from '~/components/Dropdown'
import FilterPosts from '~/components/FilterPosts/FilterPosts.vue'
import HcAvatar from '~/components/Avatar/Avatar.vue'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import NotificationMenu from '~/components/notifications/NotificationMenu/NotificationMenu'
import SearchInput from '~/components/SearchInput.vue'

export default {
  components: {
    Dropdown,
    HcAvatar,
    FilterPosts,
    LocaleSwitch,
    NotificationMenu,
    SearchInput,
  },
  data() {
    return {
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
    matcher(url, route) {
      if (url.indexOf('/profile') === 0) {
        // do only match own profile
        return this.$route.path === url
      }
      return this.$route.path.indexOf(url) === 0
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
.page-header {
  position: fixed;
  width: 100%;
  height: 65px;
  padding: $space-x-small;
  background-color: $color-neutral-100;
}

.page-header__content {
  display: flex;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: auto;

  .ds-logo {
    margin-right: $space-small;
  }
}
</style>
