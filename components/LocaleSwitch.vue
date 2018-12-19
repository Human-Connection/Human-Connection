<template>
  <dropdown
    ref="menu"
    placement="right-start"
  >
    <template
      slot="default"
      slot-scope="{toggleMenu}"
    >
      <a
        class="locale-menu"
        href="#"
        @click.prevent="toggleMenu()"
      >
        <img
          :alt="current.name"
          :title="current.name"
          :src="`/img/locale-flags/${current.code}.svg`"
          height="26"
        >
      </a>
    </template>
    <template slot="popover">
      <ul class="locale-menu-popover">
        <li
          v-for="locale in locales"
          :key="locale.code"
        >
          <a
            href="#"
            :class="[ current.code === locale.code && 'active' ]"
            @click.prevent="changeLanguage(locale.code)"
          >
            <img
              :alt="locale.name"
              :title="locale.name"
              :src="`/img/locale-flags/${locale.code}.svg`"
              height="26"
            > {{ locale.name }}
          </a>
        </li>
      </ul>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import find from 'lodash/find'

export default {
  components: {
    Dropdown
  },
  computed: {
    current() {
      return find(this.locales, ['code', this.$i18n.locale()])
    },
    locales() {
      return [
        {
          name: 'English',
          code: 'en'
        },
        {
          name: 'Deutsch',
          code: 'de'
        },
        {
          name: 'Nederlands',
          code: 'nl'
        },
        {
          name: 'Italiano',
          code: 'it'
        },
        {
          name: 'Español',
          code: 'es'
        },
        {
          name: 'Portuguese',
          code: 'pt'
        },
        {
          name: 'Polski',
          code: 'pl'
        }
      ]
    }
  },
  methods: {
    changeLanguage(locale) {
      // TODO: move that logic to store!?
      // check if the locale has already been loaded
      if (this.$i18n.localeExists(locale)) {
        this.$i18n.set(locale)
        this.$refs.menu.toggleMenu()
        return
      }
      import(`~/locales/${locale}.json`).then(res => {
        this.$i18n.add(locale, res.default)
        this.$i18n.set(locale)
        this.$refs.menu.toggleMenu()
      })
    }
  }
}
</script>

<style lang="scss">
ul.locale-menu-popover {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    a {
      opacity: 0.8;

      display: block;
      padding: 0.2rem 0;

      &:hover {
        opacity: 1;
      }
      &.active {
        opacity: 1;
        font-weight: bold;
      }
    }
  }
}
</style>
