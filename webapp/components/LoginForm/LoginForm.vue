<template>
  <ds-container width="medium">
    <ds-space margin="small">
      <blockquote>
        <p>{{ $t('quotes.african.quote') }}</p>
        <b>- {{ $t('quotes.african.author') }}</b>
      </blockquote>
    </ds-space>
    <ds-card class="login-card">
      <ds-flex gutter="small">
        <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
          <client-only>
            <locale-switch class="login-locale-switch" offset="5" />
          </client-only>
          <ds-space margin-top="small" margin-bottom="xxx-small" centered>
            <img
              class="login-image"
              alt="Human Connection"
              src="/img/sign-up/humanconnection.svg"
            />
          </ds-space>
        </ds-flex-item>
        <ds-flex-item :width="{ base: '100%', sm: '50%' }" centered>
          <ds-space margin="small">
            <a :href="$t('login.moreInfoURL')" :title="$t('login.moreInfoHint')" target="_blank">
              {{ $t('login.moreInfo') }}
            </a>
          </ds-space>
          <ds-space margin="small">
            <ds-text size="small">{{ $t('login.copy') }}</ds-text>
          </ds-space>
          <form :disabled="pending" @submit.prevent="onSubmit">
            <ds-input
              v-model="form.email"
              :disabled="pending"
              :placeholder="$t('login.email')"
              type="email"
              name="email"
              icon="envelope"
            />
            <ds-input
              v-model="form.password"
              :disabled="pending"
              :placeholder="$t('login.password')"
              icon="lock"
              icon-right="question-circle"
              name="password"
              type="password"
            />
            <ds-space margin-bottom="large">
              <nuxt-link to="/password-reset/request">{{ $t('login.forgotPassword') }}</nuxt-link>
            </ds-space>
            <ds-button
              :loading="pending"
              primary
              fullwidth
              name="submit"
              type="submit"
              icon="sign-in"
            >
              {{ $t('login.login') }}
            </ds-button>
            <ds-space margin-top="large" margin-bottom="x-small">
              {{ $t('login.no-account') }}
              <nuxt-link to="/registration/signup">{{ $t('login.register') }}</nuxt-link>
            </ds-space>
          </form>
        </ds-flex-item>
      </ds-flex>
    </ds-card>
  </ds-container>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch.vue'

export default {
  components: {
    LocaleSwitch,
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
    }
  },
  computed: {
    pending() {
      return this.$store.getters['auth/pending']
    },
  },
  methods: {
    async onSubmit() {
      try {
        await this.$store.dispatch('auth/login', { ...this.form })
        this.$toast.success(this.$t('login.success'))
        this.$emit('success')
      } catch (err) {
        this.$toast.error(err.message)
      }
    },
  },
}
</script>

<style lang="scss">
.login-image {
  width: 90%;
  max-width: 200px;
}
.login-card {
  position: relative;
}
.login-locale-switch {
  position: absolute;
  top: 1em;
  left: 1em;
}
</style>
