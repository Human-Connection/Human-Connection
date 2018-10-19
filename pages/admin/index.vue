<template>
  <ds-card>
    <no-ssr>
      <ds-space margin="large">
        <ds-flex>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Users"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countUsers || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Posts"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countPosts || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Comments"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countComments || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
        </ds-flex>
      </ds-space>
      <ds-space margin="x-large">
        <ds-flex>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Notifications"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countNotifications || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Organization"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countOrganizations || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Projects"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countProjects || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
        </ds-flex>
      </ds-space>
      <ds-space margin="x-large">
        <ds-flex>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Open Invites"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countInvites || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Follows"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countFollows || 0" />
              </no-ssr>
            </ds-number>
          </ds-flex-item>
          <ds-flex-item>
            <ds-number
              :count="0"
              label="Shouts"
              size="x-large"
              uppercase>
              <no-ssr slot="count">
                <hc-count-to :end-val="statistics.countShouts || 0" />
              </no-ssr>
            </ds-number>
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
    HcCountTo
  },
  data() {
    return {
      statistics: {}
    }
  },
  computed: {
    isClient() {
      return process.client
    }
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
      `)
    }
  }
}
</script>
