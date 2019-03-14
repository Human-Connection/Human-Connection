<template>
  <dropdown
    class="content-menu"
    :placement="placement"
    offset="5"
  >
    <template
      slot="default"
      slot-scope="{toggleMenu}"
    >
      <slot
        name="button"
        :toggleMenu="toggleMenu"
      >
        <ds-button
          class="content-menu-trigger"
          size="small"
          ghost
          @click.prevent="toggleMenu"
        >
          <ds-icon name="ellipsis-v" />
        </ds-button>
      </slot>
    </template>
    <div
      slot="popover"
      slot-scope="{toggleMenu}"
      class="content-menu-popover"
    >
      <ds-menu :routes="routes">
        <ds-menu-item
          slot="menuitem"
          slot-scope="item"
          :route="item.route"
          :parents="item.parents"
          @click.stop.prevent="openItem(item.route, toggleMenu)"
        >
          <ds-icon :name="item.route.icon" />
          {{ item.route.name }}
        </ds-menu-item>
      </ds-menu>
    </div>
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
    itemId: { type: String, required: true },
    isOwner: { type: Boolean, default: false },
    resourceType: {
      type: String,
      required: true,
      validator: value => {
        return value.match(/(contribution|comment|organization|user)/)
      }
    }
  },
  computed: {
    routes() {
      let routes = []

      if (this.isOwner && this.resourceType === 'contribution') {
        routes.push({
          name: this.$t(`contribution.edit`),
          path: this.$router.resolve({
            name: 'post-edit-id',
            params: {
              id: this.itemId
            }
          }).href,
          icon: 'edit'
        })
      }
      if (this.isOwner && this.resourceType === 'comment') {
        routes.push({
          name: this.$t(`comment.edit`),
          callback: () => {
            console.log('EDIT COMMENT')
          },
          icon: 'edit'
        })
      }

      if (!this.isOwner) {
        routes.push({
          name: this.$t(`report.${this.resourceType}.title`),
          callback: () => {
            this.openModal('report')
          },
          icon: 'flag'
        })
      }

      if (!this.isOwner && this.isModerator) {
        routes.push({
          name: this.$t(`disable.${this.resourceType}.title`),
          callback: () => {
            this.openModal('disable')
          },
          icon: 'eye-slash'
        })
      }

      if (this.isOwner && this.resourceType === 'user') {
        routes.push({
          name: this.$t(`settings.data.name`),
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          callback: () => this.$router.push('/settings'),
          icon: 'edit'
        })
      }
      return routes
    },
    isModerator() {
      return this.$store.getters['auth/isModerator']
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
    openModal(dialog) {
      this.$store.commit('modal/SET_OPEN', {
        name: dialog,
        data: {
          type: this.resourceType,
          id: this.itemId,
          name: this.name
        }
      })
    }
  }
}
</script>

<style lang="scss">
.content-menu-popover {
  nav {
    margin-top: -$space-xx-small;
    margin-bottom: -$space-xx-small;
    margin-left: -$space-x-small;
    margin-right: -$space-x-small;
  }
}
</style>
