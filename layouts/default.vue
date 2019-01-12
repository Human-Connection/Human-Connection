<template>
  <div class="layout-default">
    <div class="main-navigation">
      <ds-container style="padding: .5rem 3rem .2rem;">
        <a
          v-router-link
          href="/"
        >
          <ds-logo />
        </a>
        <div style="float: right">
          <no-ssr>
            <locale-switch
              class="topbar-locale-switch"
              placement="bottom"
              offset="24"
            />
          </no-ssr>
          <template v-if="isLoggedIn">
            <no-ssr>
              <dropdown class="avatar-menu">
                <template
                  slot="default"
                  slot-scope="{toggleMenu}"
                >
                  <a
                    class="avatar-menu-trigger"
                    :href="$router.resolve({name: 'profile-slug', params: {slug: user.slug}}).href"
                    @click.prevent="toggleMenu"
                  >
                    <ds-avatar
                      :image="user.avatar"
                      :name="user.name"
                      size="42"
                    />
                  </a>
                </template>
                <template
                  slot="popover"
                  slot-scope="{closeMenu}"
                >
                  <div class="avatar-menu-popover">
                    {{ $t('login.hello') }} <b>{{ user.name }}</b>
                    <ds-menu
                      :routes="routes"
                      :is-exact="isExact"
                    >
                      <ds-menu-item
                        slot="Navigation"
                        slot-scope="item"
                        :route="item.route"
                        :parents="item.parents"
                        @click.native="closeMenu(false)"
                      >
                        <ds-icon :name="item.route.icon" /> {{ item.route.name }}
                      </ds-menu-item>
                    </ds-menu>
                    <ds-space margin="xx-small" />
                    <nuxt-link
                      :to="{ name: 'logout'}"
                      style="margin-left: 0"
                    >
                      <ds-icon name="sign-out" /> {{ $t('login.logout') }}
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch'
import Dropdown from '~/components/Dropdown'
import seo from '~/components/mixins/seo'

export default {
  components: {
    Dropdown,
    LocaleSwitch
  },
  mixins: [seo],
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isLoggedIn: 'auth/isLoggedIn',
      isAdmin: 'auth/isAdmin'
    }),
    routes() {
      if (!this.user.slug) {
        return []
      }
      let routes = [
        {
          name: this.$t('profile.name'),
          path: `/profile/${this.user.slug}`,
          icon: 'user'
        },
        {
          name: this.$t('settings.name'),
          path: `/settings`,
          icon: 'cogs'
        }
      ]
      if (this.isAdmin) {
        routes.push({
          name: this.$t('admin.name'),
          path: `/admin`,
          icon: 'shield'
        })
      }
      return routes
    }
  },
  methods: {
    isExact(url) {
      if (url.indexOf('/profile') === 0) {
        // do only match own profile
        this.$route.path === url
      }
      return this.$route.path.indexOf(url) === 0
    }
  }
}
</script>

<style lang="scss">
.topbar-locale-switch {
  display: inline-block;
  top: 8px;
  right: 10px;
  position: relative;
}
.avatar-menu {
  float: right;
}

.avatar-menu-trigger {
  user-select: none;
}
.avatar-menu-popover {
  display: inline-block;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;

  nav {
    margin-left: -16px;
    margin-right: -10px;
    padding-top: 1rem;
    padding-bottom: 1rem;

    a {
      padding-left: 12px;
    }
  }
}
</style>
