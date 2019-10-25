<template>
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
</template>
<script>
import { mapGetters } from 'vuex'
import Dropdown from '~/components/Dropdown'
import HcAvatar from '~/components/Avatar/Avatar.vue'

export default {
  components: {
    Dropdown,
    HcAvatar,
  },
  props: {
    placement: { type: String, default: 'top-end' },
    user: { type: Object, default: null },
  },
  computed: {
    ...mapGetters({
      user: 'auth/user',
      isModerator: 'auth/isModerator',
      isAdmin: 'auth/isAdmin',
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
          name: this.$t('notifications.pageLink'),
          path: '/notifications',
          icon: 'bell',
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
    userName() {
      const { name } = this.user || {}
      return name || this.$t('profile.userAnonym')
    },
  },
  methods: {
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
<style lang="scss" scoped>
.avatar-menu {
  margin: 2px 0px 0px 5px;
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
