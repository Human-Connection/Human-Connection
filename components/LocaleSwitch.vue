<template>
  <dropdown
    ref="menu"
    :placement="placement"
    :offset="offset"
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
            style="display: flex; align-items: center;"
            :class="[
              locale.code,
              current.code === locale.code && 'active'
            ]"
            @click.prevent="changeLanguage(locale.code)"
          >
            <img
              :alt="locale.name"
              :title="locale.name"
              :src="`/img/locale-flags/${locale.code}.svg`"
              width="20"
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
  props: {
    placement: { type: String, default: 'bottom-start' },
    offset: { type: [String, Number], default: '16' }
  },
  data() {
    return {
      locales: process.env.locales
    }
  },
  computed: {
    current() {
      return find(this.locales, { code: this.$i18n.locale() })
    }
  },
  methods: {
    changeLanguage(locale) {
      this.$i18n.set(locale)
      this.$refs.menu.toggleMenu()
    }
  }
}
</script>

<style lang="scss">
.locale-menu {
  user-select: none;
}

ul.locale-menu-popover {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    a {
      opacity: 0.8;

      display: block;
      padding: 0.3rem 0;

      img {
        margin-right: 8px;
      }

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
