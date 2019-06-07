<template>
  <div>
    <ds-card hover>
      <ds-space />
      <ds-container>
        <ds-flex>
          <ds-flex-item width="8%">
            <ds-icon name="warning" size="xxx-large" class="delete-warning-icon" />
          </ds-flex-item>
          <ds-flex-item width="80%">
            <ds-heading>{{ $t('settings.delete.name') }}</ds-heading>
          </ds-flex-item>
          <ds-space />
          <ds-heading tag="h4">{{ $t('settings.delete.accountDescription') }}</ds-heading>
        </ds-flex>
      </ds-container>
      <ds-space />
      <ds-container>
        <transition name="slide-up">
          <div v-if="deleteEnabled">
            <div class="field">
              <div class="control">
                <b-checkbox
                  type="is-danger"
                  :disabled="!currentUser.contributionsCount"
                  v-model="deleteContributions"
                >
                  {{ $t('settings.delete.countPosts', { count: currentUser.contributionsCount }) }}
                </b-checkbox>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <b-checkbox
                  type="is-danger"
                  :disabled="!currentUser.commentsCount"
                  v-model="deleteComments"
                >
                  {{ $t('settings.delete.countComments', { count: currentUser.commentsCount }) }}
                </b-checkbox>
              </div>
            </div>
            <div class="message is-danger">
              <div class="message-body" v-html="$t('settings.delete.accountWarning')"></div>
            </div>
          </div>
        </transition>
      </ds-container>
      <template slot="footer">
        <ds-container>
          <ds-flex>
            <ds-flex-item width="40%">
              <div class="columns is-mobile">
                <div class="column">
                  <b-switch type="is-danger" v-model="deleteEnabled"></b-switch>
                </div>
              </div>
            </ds-flex-item>
            <ds-flex-item width="20%" />
            <ds-flex-item>
              <ds-button
                icon="trash"
                danger
                :disabled="isLoading || !deleteEnabled"
                @click="handleSubmit"
              >
                {{ $t('settings.delete.name') }}
              </ds-button>
            </ds-flex-item>
          </ds-flex>
        </ds-container>
      </template>
    </ds-card>
  </div>
</template>
<script>
import { mapGetters, mapActions } from 'vuex'
import gql from 'graphql-tag'

export default {
  name: 'DeleteAccount',
  data() {
    return {
      deleteContributions: false,
      deleteComments: false,
      deleteEnabled: false,
      isLoading: false,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout',
    }),
    handleSubmit() {
      let resourceArgs = []
      if (this.deleteContributions) {
        resourceArgs.push('Post')
      }
      if (this.deleteComments) {
        resourceArgs.push('Comment')
      }
      this.$apollo
        .mutate({
          mutation: gql`
            mutation($id: ID!, $resource: [String]) {
              DeleteUser(id: $id, resource: $resource) {
                id
              }
            }
          `,
          variables: { id: this.currentUser.id, resource: resourceArgs },
        })
        .then(() => {
          this.$toast.success(this.$t('settings.delete.success'))
          this.logout()
          this.$router.history.push('/')
        })
        .catch(error => {
          this.$toast.error(error.message)
        })
    },
  },
}
</script>
<style lang="scss">
.delete-warning-icon {
  color: $color-danger;
}
</style>
