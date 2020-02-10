<template>
  <section class="login-form">
    <blockquote>
      <p>{{ $t('quotes.african.quote') }}</p>
      <b>- {{ $t('quotes.african.author') }}</b>
    </blockquote>
    <base-card>
      <client-only>
        <locale-switch class="locale-switch" />
      </client-only>
      <a :href="$t('login.moreInfoURL')" :title="$t('login.moreInfo')" target="_blank" class="link">
        <img class="image" alt="Human Connection" src="/img/sign-up/humanconnection.svg" />
      </a>
      <form :disabled="pending" @submit.prevent="onSubmit" class="form">
        <h2 class="title">{{ $t('login.login') }}</h2>
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
        <nuxt-link to="/password-reset/request" class="password-link">
          {{ $t('login.forgotPassword') }}
        </nuxt-link>
        <base-button :loading="pending" filled name="submit" type="submit" icon="sign-in">
          {{ $t('login.login') }}
        </base-button>
        <p class="signup-hint">
          {{ $t('login.no-account') }}
          <nuxt-link to="/registration/signup">{{ $t('login.register') }}</nuxt-link>
        </p>
      </form>
    </base-card>
  </section>
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
      const { email, password } = this.form
      try {
        await this.$store.dispatch('auth/login', { email, password })
        this.$toast.success(this.$t('login.success'))
        this.$emit('success')
      } catch (err) {
        this.$toast.error(this.$t('login.failure'))
      }
    },
  },
}
</script>

<style lang="scss">
.login-form {
  width: 80vw;
  max-width: 620px;
  margin: auto;

  > .base-card {
    position: relative;
    display: flex;

    > .locale-switch {
      position: absolute;
      top: $space-small;
      left: $space-small;
    }

    > .link {
      flex-basis: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      > .image {
        width: 90%;
        max-width: 200px;
      }
    }

    > .form {
      flex-basis: 50%;

      > .title {
        margin-bottom: $space-small;
      }

      > .password-link {
        display: block;
        margin-bottom: $space-large;
      }

      > .base-button {
        display: block;
        width: 100%;
        margin-bottom: $space-small;
      }
    }
  }
}
</style>
