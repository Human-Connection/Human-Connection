<template>
  <ds-card>
    <no-ssr>
      <ds-space margin="large">
        <ds-flex>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.users')"
                size="x-large"
                uppercase
              >
                <no-ssr slot="count">
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countUsers || 0"
                  />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.posts')"
                size="x-large"
                uppercase
              >
                <no-ssr slot="count">
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countPosts || 0"
                  />
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
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countComments || 0"
                  />
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
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countNotifications || 0"
                  />
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
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countOrganizations || 0"
                  />
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
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countProjects || 0"
                  />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.invites')"
                size="x-large"
                uppercase
              >
                <no-ssr slot="count">
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countInvites || 0"
                  />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.follows')"
                size="x-large"
                uppercase
              >
                <no-ssr slot="count">
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countFollows || 0"
                  />
                </no-ssr>
              </ds-number>
            </ds-space>
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: '50%', md: '33%' }">
            <ds-space margin="small">
              <ds-number
                :count="0"
                :label="$t('admin.dashboard.shouts')"
                size="x-large"
                uppercase
              >
                <no-ssr slot="count">
                  <hc-count-to
                    :start-val="0"
                    :end-val="statistics.countShouts || 0"
                  />
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
  mounted() {
    this.$apollo.queries.statistics.startPolling(5000)
  },
  apollo: {
    statistics: {
      query: gql(`
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
      `),
    },
  },
}
</script>
