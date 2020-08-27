<template>
  <base-card class="delete-data">
    <h2 class="title">
      <base-icon name="warning" />
      {{ $t('settings.deleteUserAccount.name') }}
    </h2>
    <label>
      {{ $t('settings.deleteUserAccount.pleaseConfirm', { confirm: currentUser.name }) }}
    </label>
    <ds-input v-model="enableDeletionValue" />
    <p v-show="enableDeletionValue" class="notice">
      {{ $t('settings.deleteUserAccount.accountDescription') }}
    </p>
    <label class="checkbox">
      <input
        type="checkbox"
        v-model="deleteContributions"
        data-test="contributions-deletion-checkbox"
      />
      {{
        $t(
          'settings.deleteUserAccount.contributionsCount',
          {
            count: currentUserCounts.contributionsCount,
          },
          currentUserCounts.contributionsCount,
        )
      }}
    </label>
    <label class="checkbox">
      <input type="checkbox" v-model="deleteComments" data-test="comments-deletion-checkbox" />
      {{
        $t(
          'settings.deleteUserAccount.commentedCount',
          {
            count: currentUserCounts.commentedCount,
          },
          currentUserCounts.commentedCount,
        )
      }}
    </label>
    <section class="warning">
      <p>{{ $t('settings.deleteUserAccount.accountWarning') }}</p>
    </section>
    <base-button
      icon="trash"
      danger
      filled
      :disabled="!deleteEnabled"
      data-test="delete-button"
      @click="handleSubmit"
    >
      {{ $t('settings.deleteUserAccount.name') }}
    </base-button>
  </base-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import gql from 'graphql-tag'
import { currentUserCountQuery } from '~/graphql/User'

export default {
  name: 'DeleteData',
  data() {
    return {
      deleteContributions: false,
      deleteComments: false,
      enableDeletionValue: null,
      currentUserCounts: {},
    }
  },
  apollo: {
    currentUser: {
      query() {
        return currentUserCountQuery()
      },
      update(currentUser) {
        this.currentUserCounts = currentUser.currentUser
      },
    },
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    deleteEnabled() {
      return this.enableDeletionValue === this.currentUser.name
    },
  },
  methods: {
    ...mapActions({
      logout: 'auth/logout',
    }),
    handleSubmit() {
      const resourceArgs = []
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
        .catch((error) => {
          this.$toast.error(error.message)
        })
    },
  },
}
</script>

<style lang="scss">
.delete-data {
  display: flex;
  flex-direction: column;

  > .title > .base-icon {
    color: $color-danger;
  }

  > .ds-form-item {
    align-self: flex-start;
    margin-top: $space-xxx-small;
  }

  > .notice {
    font-weight: $font-weight-bold;
    margin-bottom: $space-small;
  }

  > .checkbox {
    margin-left: $space-base;
    margin-bottom: $space-x-small;

    &:last-of-type {
      margin-bottom: $space-small;
    }
  }

  > .warning {
    padding: $space-large;
    margin-bottom: $space-small;
    border-radius: $border-radius-base;

    color: $color-danger;
    background-color: $color-danger-inverse;
    border-left: 4px solid $color-danger;
  }

  > .base-button {
    align-self: flex-start;
  }
}
</style>
