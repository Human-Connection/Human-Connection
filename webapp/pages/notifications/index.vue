<template>
  <ds-card space="small">
    <ds-flex>
      <ds-flex-item :width="{ lg: '85%' }">
        <ds-heading tag="h3">{{ $t('notifications.title') }}</ds-heading>
      </ds-flex-item>
      <ds-flex-item class="sorting-dropdown">
        <dropdown>
          <a
            slot="default"
            slot-scope="{ toggleMenu }"
            class="locale-menu"
            href="#"
            @click.prevent="toggleMenu()"
          >
            <ds-icon style="margin-right: 2px;" name="sort" />
            {{ 'All' }}
            <ds-icon style="margin-left: 2px" size="xx-small" name="angle-down" />
          </a>
          <ds-menu
            slot="popover"
            slot-scope="{ toggleMenu }"
            class="locale-menu-popover"
            :routes="routes"
          >
            <ds-menu-item
              slot="menuitem"
              slot-scope="item"
              class="locale-menu-item"
              :route="item.route"
              :parents="item.parents"
              @click.stop.prevent="sortNotifications(item.route.option, toggleMenu)"
            >
              {{ item.route.option }}
            </ds-menu-item>
          </ds-menu>
        </dropdown>
      </ds-flex-item>
    </ds-flex>
    <ds-space />
    <ds-table
      v-if="notifications && notifications.length"
      :data="notifications"
      :fields="fields"
      id="notifications-table"
    >
      <template slot="notifications" slot-scope="scope">
        <ds-space :class="{ read: scope.row.read, notification: true }" margin="small">
          <client-only>
            <ds-space margin-bottom="x-small">
              <hc-user
                :user="scope.row.from.author"
                :date-time="scope.row.from.createdAt"
                :trunc="35"
              />
            </ds-space>
            <ds-text class="reason-text-for-test" color="soft">
              {{ $t(`notifications.reason.${scope.row.reason}`) }}
            </ds-text>
          </client-only>
          <ds-space margin-bottom="x-small" />
          <nuxt-link
            class="notification-mention-post"
            :to="{ name: 'post-id-slug', params, ...hashParam }"
            @click.native="$emit('read')"
          >
            <ds-space margin-bottom="x-small">
              <ds-card
                :header="scope.row.from.title || scope.row.from.post.title"
                hover
                space="x-small"
                class="notifications-card"
              >
                <ds-space margin-bottom="x-small" />
                <div>
                  <span v-if="isComment" class="comment-notification-header">
                    {{ $t(`notifications.comment`) }}:
                  </span>
                  {{ scope.row.from.contentExcerpt | removeHtml }}
                </div>
              </ds-card>
            </ds-space>
          </nuxt-link>
        </ds-space>
      </template>
      <!-- <template slot="user" slot-scope="scope">
        <ds-space margin-bottom="base">
          <hc-user
            :user="scope.row.from.author"
            :date-time="scope.row.from.createdAt"
            :trunc="35"
          />
        </ds-space>
        {{ $t(`notifications.reason.${scope.row.reason}`) }}
      </template>
      <template slot="type" slot-scope="scope">
        <nuxt-link
          class="notification-mention-post"
          :to="{ name: 'post-id-slug', params, ...hashParam }"
          @click.native="$emit('read')"
        >
          <ds-space margin-bottom="x-small">
            <ds-card
              :header="scope.row.from.title || scope.row.from.post.title"
              hover
              space="x-small"
              class="notifications-card"
            >
              <ds-space margin-bottom="x-small" />
              <div>
                <span v-if="isComment" class="comment-notification-header">
                  {{ $t(`notifications.comment`) }}:
                </span>
                {{ scope.row.from.contentExcerpt | removeHtml }}
              </div>
            </ds-card>
          </ds-space>
        </nuxt-link>
      </template> -->
    </ds-table>
    <hc-empty v-else icon="alert" :message="$t('moderation.reports.empty')" />
  </ds-card>
</template>

<script>
import HcUser from '~/components/User/User'
import HcEmpty from '~/components/Empty.vue'
import Dropdown from '~/components/Dropdown'
import { notificationQuery } from '~/graphql/User'

export default {
  components: {
    HcUser,
    Dropdown,
    HcEmpty,
  },
  data() {
    return {
      notifications: [],
      sortingOptions: ['All', 'Read', 'Unread'],
      nofiticationRead: null,
    }
  },
  computed: {
    fields() {
      return {
        notifications: null,
        // user: this.$t('notifications.user'),
        // type: this.$t('notifications.type'),
      }
    },
    routes() {
      let routes = this.sortingOptions.map(option => {
        return {
          option,
        }
      })
      return routes
    },
  },
  methods: {
    sortNotifications(option, toggleMenu) {
      if (option === 'Read') {
        this.notificationRead = true
      } else if (option === 'Unread') {
        this.notificationRead = false
      } else {
        this.notificationRead = null
      }
      this.$apollo.queries.notificationsPage.refetch()
      toggleMenu()
    },
  },
  apollo: {
    notificationsPage: {
      query() {
        return notificationQuery(this.$i18n)
      },
      update({ notifications }) {
        this.notifications = notifications
      },
      fetchPolicy: 'cache-and-network',
      error(error) {
        this.$toast.error(error.message)
      },
    },
  },
}
</script>
<style lang="scss">
.sorting-dropdown {
  float: right;
}
#notifications-table thead {
  display: none;
}
</style>
