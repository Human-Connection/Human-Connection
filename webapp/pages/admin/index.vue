<template>
  <ds-card>
    <no-ssr>
      <ds-space margin="large">
        <ds-flex>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.users')" size="x-large" uppercase>
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countUsers" />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.posts')" size="x-large" uppercase>
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countPosts" />
                </no-ssr>
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
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countComments" />
                </no-ssr>
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
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countNotifications" />
                </no-ssr>
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
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countOrganizations" />
                </no-ssr>
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
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countProjects" />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.invites')" size="x-large" uppercase>
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countInvites" />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.follows')" size="x-large" uppercase>
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countFollows" />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number :count="0" :label="$t('admin.dashboard.shouts')" size="x-large" uppercase>
                <no-ssr slot="count">
                  <hc-count-to :end-val="statistics.countShouts" />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
        </ds-flex>
      </ds-space>
    </no-ssr>
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
