<template>
  <div>
    <ds-card hover>
      <ds-space />
      <ds-container>
        <ds-flex>
          <ds-flex-item :width="{ base: '22%', sm: '12%', md: '12%', lg: '8%' }">
            <ds-icon name="warning" size="xxx-large" class="delete-warning-icon" />
          </ds-flex-item>
          <ds-flex-item :width="{ base: '78%', sm: '88%', md: '88%', lg: '92%' }">
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
            <label v-if="currentUser.contributionsCount" class="checkbox-container">
              <input type="checkbox" v-model="deleteContributions" />
              <span class="checkmark"></span>
              {{
                $t('settings.deleteUserAccount.contributionsCount', {
                  count: currentUser.contributionsCount,
                })
              }}
            </label>
            <ds-space margin-bottom="small" />
            <label v-if="currentUser.commentsCount" class="checkbox-container">
              <input type="checkbox" v-model="deleteComments" />
              <span class="checkmark"></span>
              {{
                $t('settings.deleteUserAccount.commentsCount', {
                  count: currentUser.commentsCount,
                })
              }}
            </label>
            <ds-space margin-bottom="small" />
            <ds-section id="delete-user-account-warning">
              <div v-html="$t('settings.deleteUserAccount.accountWarning')"></div>
            </ds-section>
          </div>
        </transition>
      </ds-container>
      <template slot="footer" class="delete-data-footer">
        <ds-container>
          <div
            class="delete-input-label"
            v-html="$t('settings.deleteUserAccount.pleaseConfirm', { confirm: currentUser.name })"
          ></div>
          <ds-space margin-bottom="xx-small" />
          <ds-flex :gutter="{ base: 'xx-small', md: 'small', lg: 'large' }">
            <ds-flex-item :width="{ base: '100%', sm: '100%', md: '100%', lg: 1.75 }">
              <ds-input
                v-model="enableDeletionValue"
                @input="enableDeletion"
                class="enable-deletion-input"
              />
            </ds-flex-item>
            <ds-flex-item :width="{ base: '100%', sm: '100%', md: '100%', lg: 1 }">
              <ds-button icon="trash" danger :disabled="!deleteEnabled" @click="handleSubmit">
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
  name: 'DeleteData',
  data() {
    return {
      deleteContributions: false,
      deleteComments: false,
      deleteEnabled: false,
      enableDeletionValue: null,
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
            mutation($id: ID!, $resource: [Deletable]) {
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

.checkbox-container {
  display: block;
  position: relative;
  padding-left: 35px;
  cursor: pointer;
  font-size: $font-size-large;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  border: 2px solid $background-color-inverse-softer;
  background-color: $background-color-base;
  border-radius: $border-radius-x-large;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: $background-color-softest;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: $background-color-danger-active;
}

.checkmark:after {
  content: '';
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid $background-color-base;
  border-width: 0 $border-size-large $border-size-large 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.enable-deletion-input input:focus {
  border-color: $border-color-danger;
}

.delete-input-label {
  font-size: $font-size-base;
}

b.is-danger {
  color: $text-color-danger;
}

.delete-data-footer {
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
