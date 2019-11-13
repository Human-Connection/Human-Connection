<template>
  <ds-card :header="$t('settings.privacy.name')">
    <ds-space margin-bottom="small">
      <input id="allow-shouts" type="checkbox" v-model="shoutsAllowed" />
      <label for="allow-shouts">{{ $t('settings.privacy.make-shouts-public') }}</label>
    </ds-space>
    <ds-button primary @click="submit" :disabled="disabled">{{ $t('actions.save') }}</ds-button>
  </ds-card>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { showShoutsPubliclyMutation } from '~/graphql/User'

export default {
  data() {
    return {
      shoutsAllowed: false,
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    disabled() {
      return this.shoutsAllowed === this.currentUser.showShoutsPublicly
    },
  },
  created() {
    this.shoutsAllowed = this.currentUser.showShoutsPublicly || false
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async submit() {
      try {
        await this.$apollo.mutate({
          mutation: showShoutsPubliclyMutation(),
          variables: {
            id: this.currentUser.id,
            showShoutsPublicly: this.shoutsAllowed,
          },
          update: (_, { data: { UpdateUser } }) => {
            const { showShoutsPublicly } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              showShoutsPublicly,
            })
            this.$toast.success(this.$t('settings.privacy.success-update'))
          },
        })
      } catch (error) {
        this.$toast.error(error.message)
      }
    },
  },
}
</script>
