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
            {{ selected }}
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
              @click.stop.prevent="sortNotifications(item.route, toggleMenu)"
            >
              {{ item.route.label }}
            </ds-menu-item>
          </ds-menu>
        </dropdown>
      </ds-flex-item>
    </ds-flex>
    <ds-space />
    <ds-table
      v-if="selectedNotifications && selectedNotifications.length"
      :data="selectedNotifications"
      :fields="fields"
      class="notifications-table"
    >
      <template slot="icon" slot-scope="scope">
        <ds-icon
          v-if="scope.row.from.post"
          name="comment"
          v-tooltip="{ content: $t('notifications.comment'), placement: 'right' }"
        />
        <ds-icon
          v-else
          name="bookmark"
          v-tooltip="{ content: $t('notifications.post'), placement: 'right' }"
        />
      </template>
      <template slot="user" slot-scope="scope">
        <ds-space margin-bottom="base">
          <hc-user
            :user="scope.row.from.author"
            :date-time="scope.row.from.createdAt"
            :trunc="35"
            :class="{ 'notification-status': scope.row.read }"
          />
        </ds-space>
        <ds-text :class="{ 'notification-status': scope.row.read }">
          {{ $t(`notifications.reason.${scope.row.reason}`) }}
        </ds-text>
      </template>
      <template slot="post" slot-scope="scope">
        <nuxt-link
          class="notification-mention-post"
          :class="{ 'notification-status': scope.row.read }"
          :to="{
            name: 'post-id-slug',
            params: {
              id:
                scope.row.from.__typename === 'Comment'
                  ? scope.row.from.post.id
                  : scope.row.from.id,
              slug:
                scope.row.from.__typename === 'Comment'
                  ? scope.row.from.post.slug
                  : scope.row.from.slug,
            },
            hash: scope.row.from.__typename === 'Comment' ? `#commentId-${scope.row.from.id}` : {},
          }"
          @click.native="markNotificationAsRead(scope.row.from.id)"
        >
          <b>{{ scope.row.from.title || scope.row.from.post.title | truncate(50) }}</b>
        </nuxt-link>
      </template>
      <template slot="content" slot-scope="scope">
        <b :class="{ 'notification-status': scope.row.read }">
          {{ scope.row.from.contentExcerpt || scope.row.from.contentExcerpt | removeHtml }}
        </b>
      </template>
    </ds-table>
    <hc-empty v-else icon="alert" :message="$t('notifications.empty')" />
  </ds-card>
</template>

<script>
import HcUser from '~/components/User/User'
import HcEmpty from '~/components/Empty.vue'
import Dropdown from '~/components/Dropdown'
import { notificationQuery, markAsReadMutation } from '~/graphql/User'

export default {
  components: {
    HcUser,
    Dropdown,
    HcEmpty,
  },
  data() {
    return {
      selectedNotifications: [],
      selected: this.$t('notifications.sortingLabel.all'),
      sortingOptions: [
        { label: this.$t('notifications.sortingLabel.all'), value: null },
        { label: this.$t('notifications.sortingLabel.read'), value: true },
        { label: this.$t('notifications.sortingLabel.unread'), value: false },
      ],
      nofiticationRead: null,
    }
  },
  computed: {
    fields() {
      return {
        icon: {
          label: ' ',
          width: '60px',
        },
        user: {
          label: this.$t('notifications.user'),
          width: '33.333%',
        },
        post: this.$t('notifications.post'),
        content: this.$t('notifications.content'),
      }
    },
    routes() {
      let routes = this.sortingOptions.map(option => {
        return {
          label: option.label,
          value: option.value,
        }
      })
      return routes
    },
  },
  methods: {
    sortNotifications(option, toggleMenu) {
      this.notificationRead = option.value
      this.selected = option.label
      this.$apollo.queries.notifications.refresh()
      toggleMenu()
    },
    async markNotificationAsRead(notificationSourceId) {
      try {
        await this.$apollo.mutate({
          mutation: markAsReadMutation(this.$i18n),
          variables: { id: notificationSourceId },
        })
      } catch (error) {
        this.$toast.error(error.message)
      }
    },
  },
  apollo: {
    notifications: {
      query() {
        return notificationQuery(this.$i18n)
      },
      variables() {
        return {
          read: this.notificationRead,
          orderBy: 'updatedAt_desc',
        }
      },
      update({ notifications }) {
        this.selectedNotifications = notifications
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
.notification-status {
  opacity: 0.6; /* Real browsers */
  filter: alpha(opacity = 60); /* MSIE */
}
</style>
