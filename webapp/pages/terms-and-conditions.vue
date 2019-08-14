<template>
  <div>
    <ds-space>
      <ds-heading tag="h2">{{ $t('site.termsAndConditions') }}</ds-heading>
    </ds-space>
    <ds-container>
      <no-ssr>
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
      </no-ssr>
      <div>
        <ds-modal
          v-if="isOpen"
          v-model="isOpen"
          title="Neue Nutzerbedingungen"
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
            <p>{{ $t('termsAndConditions.have-fun') }}</p>
            <br />
            <p>
              <strong v-html="$t('termsAndConditions.closing')" />
            </p>
          </div>
        </ds-modal>
        <ds-button primary icon="rocket" @click="isOpen = true">Neue Nutzungsbedingungen bestätigen</ds-button>
      </div>
    </ds-container>
  </div>
</template>

<script>
/* if you change the version please also change here 
    "backend/src/seed/factories/users.js" */
// import { isLoggedIn } from '~/layouts/default'
import { mapActions } from 'vuex'
export const VERSION = '0.0.3'

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
    ...mapActions({
      checkTermsAndConditions: 'auth/checkTermsAndConditions',
    }),
    setNewConfirmeVersion() {
      alert('speichern! das der user die neue nutzungsbedingungen zugestimmt hat ')
    },
  },
}
</script>
