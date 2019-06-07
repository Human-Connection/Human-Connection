<template>
  <div>
    <ds-card hover>
      <ds-space />
      <ds-flex>
        <ds-flex-item width="5%" />
        <ds-flex-item>
          <ds-icon name="warning" size="xxx-large" class="delete-warning-icon" />
        </ds-flex-item>
        <ds-flex-item width="80%">
          <ds-heading>{{ $t('settings.delete.name') }}</ds-heading>
        </ds-flex-item>
        <ds-container>
          <ds-space />
          <ds-heading tag="h4">{{ $t('settings.delete.accountDescription') }}</ds-heading>
        </ds-container>
      </ds-flex>
      <ds-space />
      <ds-container>
        <transition name="slide-up">
          <div v-if="deleteEnabled">
            <div class="field">
              <div class="control">
                <b-checkbox
                  type="is-danger"
                  :disabled="!currentUser.contributionsCount"
                  v-model="formData.deleteContributions"
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
                  v-model="formData.deleteComments"
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
              <ds-button icon="trash" danger :disabled="isLoading || !deleteEnabled">
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
import { mapGetters } from 'vuex'

export default {
  name: 'DeleteAccount',
  data() {
    return {
      formData: {
        deleteContributions: false,
        deleteComments: false,
      },
      deleteEnabled: false,
      isLoading: false,
      countPosts: 0,
      countComments: 0,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  methods: {
    enableDeletion() {
      if (this.accept === 'I really want to delete my account') {
        this.disabled = false
      } else {
        this.disabled = true
      }
    },
  },
}
</script>
<style lang="scss">
.delete-warning-icon {
  color: $color-danger;
}
</style>
