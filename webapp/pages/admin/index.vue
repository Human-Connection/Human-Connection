<template>
  <ds-card>
    <client-only>
      <ds-space margin="large">
        <ds-flex>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.users')" size="x-large" uppercase>
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countUsers" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.posts')" size="x-large" uppercase>
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countPosts" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.comments')"
                size="x-large"
                uppercase
              >
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countComments" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.notifications')"
                size="x-large"
                uppercase
              >
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countNotifications" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.organizations')"
                size="x-large"
                uppercase
              >
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countOrganizations" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.projects')"
                size="x-large"
                uppercase
              >
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countProjects" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.invites')" size="x-large" uppercase>
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countInvites" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.follows')" size="x-large" uppercase>
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countFollows" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.shouts')" size="x-large" uppercase>
                <client-only slot="count">
                  <hc-count-to :end-val="statistics.countShouts" />
                </client-only>
              </ds-number>
            </ds-space>
          </ds-flex-item>
        </ds-flex>
      </ds-space>
    </client-only>
  </ds-card>
</template>

<script>
import gql from 'graphql-tag'
import HcCountTo from '~/components/CountTo.vue'

export default {
  components: {
    HcCountTo,
  },
  data() {
    return {
      statistics: {},
    }
  },
  computed: {
    isClient() {
      return process.client
    },
  },
  apollo: {
    statistics: {
      query: gql`
        query {
          statistics {
            countUsers
            countPosts
            countComments
            countNotifications
            countOrganizations
            countProjects
            countInvites
            countFollows
            countShouts
          }
        }
      `,
    },
  },
}
</script>
