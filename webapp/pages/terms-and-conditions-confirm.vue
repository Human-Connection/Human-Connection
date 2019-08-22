<template>
  <ds-container width="medium">
    <ds-card icon="balance-scale" header=" " primary centered>
      <ds-text
        tag="h2"
        v-html="$t(`termsAndConditions.termsAndConditionsNewConfirmText`)"
      ></ds-text>
      <template slot="footer">
        <ds-button @click="submit">
          {{ $t(`termsAndConditions.termsAndConditionsNewConfirm`) }}
        </ds-button>
      </template>
    </ds-card>
  </ds-container>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'
import { VERSION } from '~/pages/terms-and-conditions'
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
      isOpen: false,
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
        this.$toast.success(this.$t('site.thx'))
        this.$router.replace(this.$route.query.path || '/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
