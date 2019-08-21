<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t(`site.newTermsAndConditions`) }}</ds-heading>
    </ds-space>
    <ds-container>
      <div>
        <ds-button secondary class="display:none" @click="submit">
          {{ $t(`site.termsAndConditionsNewConfirm`) }}
        </ds-button>
      </div>
      <div>
        <ol>
          <li v-for="section in sections" :key="section">
            <strong>{{ $t(`termsAndConditions.${section}.title`) }}:</strong>
            <p v-html="$t(`termsAndConditions.${section}.description`)" />
          </li>
        </ol>
        <p>{{ $t(`termsAndConditions.have-fun`) }}</p>
        <br />
        <p>
          <strong v-html="$t(`termsAndConditions.closing`)" />
        </p>
      </div>
      <div>
        <ds-button secondary class="display:none" @click="submit">
          {{ $t(`site.termsAndConditionsNewConfirm`) }}
        </ds-button>
      </div>
    </ds-container>
  </div>
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
      title: this.$t('site.newTermsAndConditions'),
    }
  },

  computed: {
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    ...mapMutations({
      setCurrentUser: 'auth/SET_USER',
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
  methods: {
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
        this.$toast.success(this.$t('DANKE'))
        this.$router.push('/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
