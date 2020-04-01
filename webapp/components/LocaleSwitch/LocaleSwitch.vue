<template>
  <client-only>
    <dropdown ref="menu" :placement="placement" :offset="offset">
      <template #default="{ toggleMenu }">
        <a class="locale-menu" href="#" @click.prevent="toggleMenu()">
          <base-icon name="globe" />
          <span class="label">{{ current.code.toUpperCase() }}</span>
          <base-icon class="dropdown-arrow" name="angle-down" />
        </a>
      </template>
      <template #popover="{ toggleMenu }">
        <ds-menu class="locale-menu-popover" :matcher="matcher" :routes="routes">
          <template #menuitem="item">
            <ds-menu-item
              class="locale-menu-item"
              :route="item.route"
              :parents="item.parents"
              @click.stop.prevent="changeLanguage(item.route.path, toggleMenu)"
            >
              {{ item.route.name }}
            </ds-menu-item>
          </template>
        </ds-menu>
      </template>
    </dropdown>
  </client-only>
</template>

<script>
import gql from 'graphql-tag'
import Dropdown from '~/components/Dropdown'
import find from 'lodash/find'
import orderBy from 'lodash/orderBy'
import locales from '~/locales'
import { mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    Dropdown,
  },
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' },
  },
  data() {
    return {
      locales: orderBy(locales, 'name'),
    }
  },
  computed: {
    current() {
      return find(this.locales, { code: this.$i18n.locale() })
    },
    routes() {
      const routes = this.locales.map((locale) => {
        return {
          name: locale.name,
          path: locale.code,
        }
      })
      return routes
    },
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  methods: {
    changeLanguage(locale, toggleMenu) {
      this.$i18n.set(locale)
      this.updateUserLocale()
      toggleMenu()
    },
    matcher(locale) {
      return locale === this.$i18n.locale()
    },

    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async updateUserLocale() {
      if (!this.currentUser || !this.currentUser.id) return null
      try {
        await this.$apollo.mutate({
          mutation: gql`
            mutation($id: ID!, $locale: String) {
              UpdateUser(id: $id, locale: $locale) {
                id
                locale
              }
            }
          `,
          variables: {
            id: this.currentUser.id,
            locale: this.$i18n.locale(),
          },
          update: (store, { data: { UpdateUser } }) => {
            const { locale } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              locale,
            })
          },
        })
        this.$toast.success(this.$t('contribution.success'))
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>

<style lang="scss">
.locale-menu {
  user-select: none;
  display: flex;
  align-items: center;
  height: 100%;
  padding: $space-xx-small;
  color: $text-color-soft;

  > .label {
    margin: 0 $space-xx-small;
  }
}

nav.locale-menu-popover {
  margin-left: -$space-small !important;
  margin-right: -$space-small !important;

  a {
    padding: $space-x-small $space-small;
    padding-right: $space-base;
  }
}
</style>
