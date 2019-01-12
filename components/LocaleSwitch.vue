<template>
  <dropdown
    ref="menu"
    :placement="placement"
    :offset="offset"
  >
    <a
      slot="default"
      slot-scope="{toggleMenu}"
      class="locale-menu"
      href="#"
      @click.prevent="toggleMenu()"
    >
      <ds-icon
        style="margin-top: -2px; margin-right: 2px;"
        name="globe"
      /> {{ current.code.toUpperCase() }}
      <ds-icon
        style="margin-top: -2px; margin-left: 2px"
        size="xx-small"
        name="angle-down"
      />
    </a>
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
            {{ locale.name }}
          </a>
        </li>
      </ul>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'
import find from 'lodash/find'
import orderBy from 'lodash/orderBy'

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
      locales: orderBy(process.env.locales, 'name')
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
  display: flex;
  align-items: center;
  height: 100%;
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
