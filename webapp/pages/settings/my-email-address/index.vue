<template>
  <ds-card centered v-if="success">
    <transition name="ds-transition-fade">
      <sweetalert-icon icon="info" />
    </transition>
    <ds-text v-html="submitMessage" />
  </ds-card>
  <ds-form v-else v-model="form" :schema="formSchema" @submit="submit">
    <template slot-scope="{ errors }">
      <ds-card :header="$t('settings.email.name')">
        <ds-input id="email" model="email" icon="at" :label="$t('settings.email.labelEmail')" />

        <template slot="footer">
          <ds-button class="submit-button" icon="check" :disabled="errors" type="submit" primary>
            {{ $t('actions.save') }}
          </ds-button>
        </template>
      </ds-card>
    </template>
  </ds-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { AddEmailAddressMutation } from '~/graphql/EmailAddress.js'
import { SweetalertIcon } from 'vue-sweetalert-icons'

export default {
  components: {
    SweetalertIcon,
  },
  data() {
    return {
      success: false,
      formSchema: {
        email: { type: 'email', required: true },
      },
    }
  },
  computed: {
    submitMessage() {
      const { email } = this.formData
      return this.$t('settings.email.submitted', { email })
    },
    ...mapGetters({
      currentUser: 'auth/user',
    }),
    form: {
      get: function() {
        const { email } = this.currentUser
        return { email }
      },
      set: function(formData) {
        this.formData = formData
      },
    },
  },
  methods: {
    async submit() {
      const { email } = this.formData
      try {
        await this.$apollo.mutate({
          mutation: AddEmailAddressMutation,
          variables: { email },
        })
        this.$toast.success(this.$t('settings.email.success'))
        this.success = true

        setTimeout(() => {
          this.$router.push({
            path: 'my-email-address/enter-nonce',
            query: { email },
          })
        }, 3000)
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.submit-button {
  float: right;
}
</style>
