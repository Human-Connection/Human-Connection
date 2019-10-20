<template>
  <ds-container width="medium">
    <ds-card icon="balance-scale" :header="$t(`termsAndConditions.newTermsAndConditions`)" centered>
      <p>
        <ds-button>
          <nuxt-link class="post-link" :to="{ name: 'terms-and-conditions' }" target="_blank">
            {{ $t(`termsAndConditions.termsAndConditionsNewConfirmText`) }}
          </nuxt-link>
        </ds-button>
      </p>
      <ds-text>
        <input id="checkbox" type="checkbox" v-model="checked" :checked="checked" />
        <label
          for="checkbox"
          v-html="$t('termsAndConditions.termsAndConditionsNewConfirm')"
        ></label>
      </ds-text>

      <template slot="footer">
        <ds-button primary @click="submit" :disabled="!checked">{{ $t(`actions.save`) }}</ds-button>
      </template>
    </ds-card>
  </ds-container>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'
import { VERSION } from '~/constants/terms-and-conditions-version.js'
const mutation = gql`
  mutation($id: ID!, $termsAndConditionsAgreedVersion: String) {
    UpdateUser(id: $id, termsAndConditionsAgreedVersion: $termsAndConditionsAgreedVersion) {
      id
      termsAndConditionsAgreedVersion
    }
  }
`
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
          mutation,
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
