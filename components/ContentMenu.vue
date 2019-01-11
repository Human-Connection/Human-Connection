<template>
  <dropdown
    class="post-menu"
    :placement="placement"
    offset="5"
  >
    <template
      slot="default"
      slot-scope="{toggleMenu}"
    >
      <a
        class="post-menu-trigger"
        href="#"
        @click.prevent="toggleMenu()"
      >
        <ds-icon
          v-if="placement.indexOf('top') === 0"
          name="angle-up"
        />
        <ds-icon
          v-else
          name="angle-down"
        />
      </a>
    </template>
    <template
      slot="popover"
      slot-scope="{toggleMenu}"
    >
      <div class="post-menu-popover">
        <ds-menu :routes="routes">
          <ds-menu-item
            slot="Navigation"
            slot-scope="item"
            :route="item.route"
            :parents="item.parents"
            @click.stop.prevent="openItem(item.route, toggleMenu)"
          >
            <ds-icon :name="item.route.icon" /> {{ item.route.name }}
          </ds-menu-item>
        </ds-menu>
      </div>
    </template>
  </dropdown>
</template>

<script>
import Dropdown from '~/components/Dropdown'

export default {
  components: {
    Dropdown
  },
  props: {
    placement: { type: String, default: 'top-end' },
    name: { type: String, required: true },
    context: {
      type: String,
      required: true,
      validator: value => {
        return value.match(/(contribution|comment|organization|user)/)
      }
    }
  },
  computed: {
    routes() {
      let routes = [
        {
          name: this.$t('common.reportContent'),
          callback: this.openReportDialog,
          icon: 'flag'
        }
      ]
      // if (this.isAdmin) {
      //   routes.push({
      //     name: this.$t('admin.name'),
      //     path: `/admin`,
      //     icon: 'shield'
      //   })
      // }
      return routes
    }
  },
  methods: {
    openItem(route, toggleMenu) {
      if (route.callback) {
        route.callback()
      } else {
        this.$router.push(route.path)
      }
      toggleMenu()
    },
    openReportDialog() {
      this.$store.commit('modal/SET_OPEN', {
        name: 'report',
        data: {
          context: this.context,
          name: this.name
        }
      })
    }
  }
}
</script>
