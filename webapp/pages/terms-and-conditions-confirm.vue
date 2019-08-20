<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <div>
        <ol>
          <li v-for="section in sections" :key="section">
            <strong>{{ $t(`termsAndConditions.${section}.title`) }}:</strong>
            <p v-html="$t(`termsAndConditions.${section}.description`)" />
          </li>
        </ol>
        <p>{{ $t('termsAndConditions.have-fun') }}</p>
        <br />
        <p>
          <strong v-html="$t('termsAndConditions.closing')" />
        </p>
      </div>
      <div>
        <ds-modal
          v-if="isOpen"
          v-model="isOpen"
          v-title="$t(`site.termsAndConditionsNewTitle`)"
          force
          extended
          confirm-label="Ich habe es gelesen und verstanden"
          cancel-label="abbrechen"
          v-on:confirm="setNewConfirmeVersion"
        >
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
        </ds-modal>

        <ds-button primary icon="rocket" class="display:none" @click="isOpen = true">
          {{ $t(`site.termsAndConditionsNewConfirm`) }}
        </ds-button>
      </div>
    </ds-container>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import { mapGetters, mapMutations } from 'vuex'

const mutation = gql`
  mutation($id: ID!, $hasAgreedToLatestTermsAndConditions: Boolean) {
    UpdateUser(id: $id, hasAgreedToLatestTermsAndConditions: $hasAgreedToLatestTermsAndConditions) {
      id
      hasAgreedToLatestTermsAndConditions
    }
  }
`

export default {
  layout: 'default',
  head() {
    return {
      title: this.$t('site.termsAndConditions'),
    }
  },
  mounted() {
    if (!this.hasAgreedToLatestTermsAndConditions) {
      this.isOpen = true
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
    setNewConfirmeVersion() {
      /* TODO  */
      alert('speichern! das der user die neue nutzungsbedingungen zugestimmt hat ')
    },
    async submit() {
      try {
        await this.$apollo.mutate({
          mutation,
          variables: {
            id: this.currentUser.id,
            hasAgreedToLatestTermsAndConditions: true,
          },
          update: (store, { data: { UpdateUser } }) => {
            const { hasAgreedToLatestTermsAndConditions } = UpdateUser
            this.setCurrentUser({
              ...this.currentUser,
              hasAgreedToLatestTermsAndConditions,
            })
          },
        })
        this.$toast.success(this.$t('DANKE'))
      } catch (err) {
        this.$toast.error(err.message)
      } finally {
        this.$router.replace('/')
      }
    },
  },
}
</script>
