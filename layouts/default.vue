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
        <locale-switch class="topbar-locale-switch" />
        <template v-if="isLoggedIn">
          <no-ssr>
            <dropdown>
              <template
                slot="default"
                slot-scope="{toggleMenu}"
              >
                <a
                  class="avatar-menu"
                  :href="$router.resolve({name: 'profile-slug', params: {slug: user.slug}}).href"
                  @click.prevent="toggleMenu()"
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
                class="avatar-menu-popover"
              >
                {{ $t('login.hello') }} <b>{{ user.name }}</b>
                <ds-menu
                  :routes="routes"
                  :is-exact="isExact"
                  style="margin-left: -15px; margin-right: -15px; padding-top: 1rem; padding-bottom: 1rem;"
                >
                  <ds-menu-item
                    slot="Navigation"
                    slot-scope="item"
                    :route="item.route"
                    :parents="item.parents"
                    @click.native="toggleMenu"
                  >
                    <ds-icon :name="item.route.icon" /> {{ item.route.name }}
                  </ds-menu-item>
                </ds-menu>
                <ds-space margin="xx-small" />
                <nuxt-link :to="{ name: 'logout'}">
                  <ds-icon name="sign-out" /> {{ $t('login.logout') }}
                </nuxt-link>
              </template>
            </dropdown>
          </no-ssr>
        </template>
      </ds-container>
    </div>
    <ds-container>
      <div style="padding: 6rem 2rem 5rem;">
        <nuxt />
      </div>
    </ds-container>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import LocaleSwitch from '~/components/LocaleSwitch'
import Dropdown from '~/components/Dropdown'

export default {
  components: {
    Dropdown,
    LocaleSwitch
  },
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
      return this.$route.path.indexOf(url) === 0
    }
  }
}
</script>

<style lang="scss">
.topbar-locale-switch {
  display: inline-block;
  top: -16px;
  position: relative;
}
</style>
