<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container class="main-navigation-container">
        <div>
          <ds-flex>
            <ds-flex-item :width="{ base: '50px', md: '150px' }">
              <a v-router-link style="display: inline-flex" href="/">
                <ds-logo />
              </a>
            </ds-flex-item>
            <ds-flex-item>
              <div id="nav-search-box" v-on:click="unfolded" v-click-outside="foldedup">
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
            <ds-flex-item width="200px">
              <div class="main-navigation-right" style="float:right">
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
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'
import SearchInput from '~/components/SearchInput.vue'
import Modal from '~/components/Modal'
import NotificationMenu from '~/components/notifications/NotificationMenu'
import Dropdown from '~/components/Dropdown'
import HcAvatar from '~/components/Avatar/Avatar.vue'
import seo from '~/mixins/seo'

export default {
  components: {
    Dropdown,
    LocaleSwitch,
    SearchInput,
    Modal,
    NotificationMenu,
    HcAvatar,
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
    unfolded: function() {
      document.getElementById('nav-search-box').classList.add('unfolded')
    },
    foldedup: function() {
      document.getElementById('nav-search-box').classList.remove('unfolded')
    },
  },
  directives: {
    'click-outside': {
      bind: function(el, binding, vNode) {
        // Provided expression must evaluate to a function.
        if (typeof binding.value !== 'function') {
          const compName = vNode.context.name
          let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
          if (compName) {
            warn += `Found in component '${compName}'`
          }

          console.warn(warn)
        }
        // Define Handler and cache it on the element
        const bubble = binding.modifiers.bubble
        const handler = e => {
          if (bubble || (!el.contains(e.target) && el !== e.target)) {
            binding.value(e)
          }
        }
        el.__vueClickOutside__ = handler

        // add Event Listeners
        document.addEventListener('click', handler)
      },

      unbind: function(el, binding) {
        // Remove Event Listeners
        document.removeEventListener('click', el.__vueClickOutside__)
        el.__vueClickOutside__ = null
      },
    },
  },
}
</script>
<style>
.foldedup {
  position: '';
  right: ;
  left: ;
  z-index: 1;
}
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

.main-navigation {
  a {
    color: $text-color-soft;
  }
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
