<template>
  <ds-container width="medium" class="terms-and-conditions-confirm">
    <base-card>
      <base-icon name="balance-scale" />
      <h2 class="title">{{ $t(`termsAndConditions.newTermsAndConditions`) }}</h2>
      <nuxt-link :to="{ name: 'terms-and-conditions' }" target="_blank">
        <base-button>
          {{ $t(`termsAndConditions.termsAndConditionsNewConfirmText`) }}
        </base-button>
      </nuxt-link>
      <label for="checkbox">
        <input id="checkbox" type="checkbox" v-model="checked" :checked="checked" />
        {{ $t('termsAndConditions.termsAndConditionsNewConfirm') }}
      </label>
      <base-button filled @click="submit" :disabled="!checked">
        {{ $t(`actions.save`) }}
      </base-button>
    </base-card>
  </ds-container>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex'
import { VERSION } from '~/constants/terms-and-conditions-version.js'
import { updateUserMutation } from '~/graphql/User.js'

export default {
  layout: 'default',
  head() {
    return {
      title: this.$t('termsAndConditions.newTermsAndConditions'),
    }
  },
  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
  },
  data() {
    return {
      checked: false,
      sections: [
        'risk',
        'data-privacy',
        'work-in-progress',
        'code-of-conduct',
        'moderation',
        'fairness',
        'questions',
        'human-connection',
      ],
    }
  },
  asyncData({ store, redirect }) {
    if (store.getters['auth/termsAndConditionsAgreed']) {
      redirect('/')
    }
  },
  methods: {
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
    }),
    async submit() {
      try {
        await this.$apollo.mutate({
          mutation: updateUserMutation(),
          variables: {
            id: this.currentUser.id,
            termsAndConditionsAgreedVersion: VERSION,
          },
          update: (store, { data: { UpdateUser } }) => {
            const { termsAndConditionsAgreedVersion } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              termsAndConditionsAgreedVersion,
            })
          },
        })
        this.$toast.success(this.$t('site.thanks'))
        this.$router.replace(this.$route.query.path || '/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>

<style lang="scss">
.terms-and-conditions-confirm > .base-card {
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  > .base-icon {
    font-size: $font-size-xxx-large;
  }
}
</style>
