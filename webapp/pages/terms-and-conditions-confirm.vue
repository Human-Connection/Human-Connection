<template>
  <ds-container width="medium">
    <ds-card icon="balance-scale" header=" " primary centered>
      <ds-text>
        <input
          id="checkbox"
          type="checkbox"
          v-model="termsAndConditionsConfirmed"
          :checked="checked"
        />
        <label
          for="checkbox"
          v-html="$t('termsAndConditions.termsAndConditionsNewConfirm')"
        ></label>

        <ds-button ghost @click="isOpen = true">
          {{ $t(`termsAndConditions.termsAndConditionsNewConfirmText`) }}
        </ds-button>
      </ds-text>

      <template slot="footer">
        <ds-button
          secondary
          @click="submit"
          :disabled="disabledSubmitButton && !termsAndConditionsConfirmed"
        >
          {{ $t(`actions.save`) }}
        </ds-button>
      </template>
    </ds-card>

    <ds-modal
      v-if="isOpen"
      v-model="isOpen"
      :title="$t('termsAndConditions.newTermsAndConditions')"
      force
      extended
      :confirm-label="$t('termsAndConditions.agree')"
      :cancel-label="$t('actions.cancel')"
      v-on:confirm=";(disabledSubmitButton = false), (termsAndConditionsConfirmed = true)"
      v-on:cancel="disabledSubmitButton = true"
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
    compiledData() {
      return {
        template: `<p>${this.data}</p>`,
      }
    },
  },
  data() {
    return {
      disabledSubmitButton: false,
      isOpen: true,
      termsAndConditionsConfirmed: false,
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
        this.$toast.success(this.$t('site.thx'))
        this.$router.replace(this.$route.query.path || '/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>
