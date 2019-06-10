<template>
  <div>
    <ds-card hover>
      <ds-space />
      <ds-container>
        <ds-flex>
          <ds-flex-item :width="{ base: '100%', sm: 0.75, md: 0.5, lg: 0.5 }">
            <ds-icon name="warning" size="xxx-large" class="delete-warning-icon" />
          </ds-flex-item>
          <ds-flex-item :width="{ base: '100%', sm: 5.25, md: 2.75, lg: 5.5 }">
            <ds-heading>{{ $t('settings.deleteUserAccount.name') }}</ds-heading>
          </ds-flex-item>
          <ds-space />
          <ds-heading tag="h4">
            {{ $t('settings.deleteUserAccount.accountDescription') }}
          </ds-heading>
        </ds-flex>
      </ds-container>
      <ds-space />
      <ds-container>
        <transition name="slide-up">
          <div v-if="deleteEnabled">
            <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'large' }">
              <ds-flex-item
                v-if="currentUser.contributionsCount"
                :width="{ base: '100%', sm: '100%', md: '100%', lg: '100%' }"
              >
                <div
                  class="delete-input-label"
                  v-html="
                    $t('settings.deleteUserAccount.pleaseConfirm', {
                      confirm: $t('settings.deleteUserAccount.contributionsCount', {
                        count: currentUser.contributionsCount,
                      }),
                    })
                  "
                ></div>
                <ds-input
                  v-model="deleteContributionsValue"
                  @input="enableDeletion"
                  class="enable-post-deletion-input"
                />
              </ds-flex-item>
            </ds-flex>
            <ds-space margin-top="xx-small" />
            <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'large' }">
              <ds-flex-item
                v-if="currentUser.commentsCount"
                :width="{ base: '100%', sm: '100%', md: '100%', lg: '100%' }"
              >
                <div
                  class="delete-input-label"
                  v-html="
                    $t('settings.deleteUserAccount.pleaseConfirm', {
                      confirm: $t('settings.deleteUserAccount.commentsCount', {
                        count: currentUser.commentsCount,
                      }),
                    })
                  "
                ></div>
                <ds-input
                  v-model="deleteCommentsValue"
                  @input="enableDeletion"
                  class="enable-comment-deletion-input"
                />
              </ds-flex-item>
              <ds-flex-item :width="{ base: '100%', sm: '100%', md: '100%', lg: '100%' }">
                <ds-section id="delete-user-account-warning">
                  <div v-html="$t('settings.deleteUserAccount.accountWarning')"></div>
                </ds-section>
              </ds-flex-item>
            </ds-flex>
          </div>
        </transition>
      </ds-container>
      <template slot="footer">
        <ds-container>
          <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'large' }">
            <ds-flex-item :width="{ base: '100%', sm: '100%', md: '100%', lg: 1.75 }">
              <div
                class="delete-input-label"
                v-html="
                  $t('settings.deleteUserAccount.pleaseConfirm', { confirm: currentUser.name })
                "
              ></div>
              <ds-input
                v-model="enableDeletionValue"
                @input="enableDeletion"
                class="enable-deletion-input"
              />
            </ds-flex-item>
            <ds-flex-item :width="{ base: '100%', sm: '100%', md: '100%', lg: 1 }">
              <ds-button
                icon="trash"
                danger
                :disabled="isLoading || !deleteEnabled"
                @click="handleSubmit"
              >
                {{ $t('settings.deleteUserAccount.name') }}
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
      enableDeletionValue: '',
      deleteContributionsValue: '',
      deleteCommentsValue: '',
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
    enableDeletion() {
      if (this.enableDeletionValue === this.currentUser.name) {
        this.deleteEnabled = true
        this.focused = false
      }
      if (
        this.deleteContributionsValue ===
        this.$t('settings.deleteUserAccount.contributionsCount', {
          count: this.currentUser.contributionsCount,
        })
      ) {
        this.deleteContributions = true
      }
      if (
        this.deleteCommentsValue ===
        this.$t('settings.deleteUserAccount.commentsCount', {
          count: this.currentUser.commentsCount,
        })
      ) {
        this.deleteComments = true
      }
    },
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
          this.$toast.success(this.$t('settings.deleteUserAccount.success'))
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

.enable-deletion-input input:focus,
.enable-post-deletion-input input:focus,
.enable-comment-deletion-input input:focus {
  border-color: $border-color-danger;
}

.ds-button-danger {
  margin-top: 1.55rem;
}

.delete-input-label {
  font-size: $font-size-base;
}

b.is-danger {
  color: $text-color-danger;
}

.ds-card-footer {
  border-top: $border-size-base solid $border-color-softest;
  background-color: $background-color-danger-inverse;
}

#delete-user-account-warning {
  background-color: $background-color-danger-inverse;
  border-left: $border-size-x-large solid $background-color-danger-active;
  color: $text-color-danger;
  margin-left: 0px;
  margin-right: 0px;
  border-radius: $border-radius-x-large;
}
</style>
