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
            <v-popover
              :open.sync="isPopoverOpen"
              :open-group="Math.random().toString()"
              placement="bottom-end"
              trigger="manual"
              offset="10"
              style="float: right"
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
              <div
                slot="popover"
                class="avatar-menu-popover"
                style="padding-top: .5rem; padding-bottom: .5rem;"
                @mouseover="popoverMouseEnter"
                @mouseleave="popoveMouseLeave">
                {{ $t('login.hello') }} <b>{{ user.name }}</b>
                <ds-menu
                  :routes="routes"
                  :is-exact="isExact"
                  style="margin-left: -15px; margin-right: -15px; padding-top: 1rem; padding-bottom: 1rem;">
                  <ds-menu-item
                    slot="Navigation"
                    slot-scope="item"
                    :route="item.route"
                    :parents="item.parents"
                    @click.native="toggleMenu">
                    <ds-icon :name="item.route.icon" /> {{ item.route.name }}
                  </ds-menu-item>
                </ds-menu>
                <ds-space margin="xx-small" />
                <nuxt-link :to="{ name: 'logout'}">
                  <ds-icon name="sign-out" /> {{ $t('login.logout') }}
                </nuxt-link>
              </div>
            </v-popover>
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

let mouseEnterTimer = null
let mouseLeaveTimer = null

export default {
  components: {
    LocaleSwitch
  },
  data() {
    return {
      isPopoverOpen: false
    }
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
  beforeDestroy() {
    clearTimeout(mouseEnterTimer)
    clearTimeout(mouseLeaveTimer)
  },
  methods: {
    toggleMenu() {
      this.isPopoverOpen = !this.isPopoverOpen
    },
    isExact(url) {
      return this.$route.path.indexOf(url) === 0
    },
    popoverMouseEnter() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (!this.isPopoverOpen) {
        mouseEnterTimer = setTimeout(() => {
          this.isPopoverOpen = true
        }, 500)
      }
    },
    popoveMouseLeave() {
      clearTimeout(mouseEnterTimer)
      clearTimeout(mouseLeaveTimer)
      if (this.isPopoverOpen) {
        mouseLeaveTimer = setTimeout(() => {
          this.isPopoverOpen = false
        }, 300)
      }
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
