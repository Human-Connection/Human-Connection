<template>
  <section class="login-form">
    <blockquote>
      <p>{{ $t('quotes.african.quote') }}</p>
      <b>- {{ $t('quotes.african.author') }}</b>
    </blockquote>
    <base-card>
      <template #imageColumn>
        <a :href="$t('login.moreInfoURL')" :title="$t('login.moreInfo')" target="_blank">
          <img class="image" alt="Human Connection" src="/img/sign-up/humanconnection.svg" />
        </a>
      </template>
      <h2 class="title">{{ $t('login.login') }}</h2>
      <form :disabled="pending" @submit.prevent="onSubmit">
        <ds-input
          v-model="form.email"
          :disabled="pending"
          :placeholder="$t('login.email')"
          type="email"
          name="email"
          icon="envelope"
        />
        <div class="password-input-wrapper">
          <ds-input
            v-model="form.password"
            :disabled="pending"
            :placeholder="$t('login.password')"
            icon="lock"
            name="password"
            :type="passwordInputType"
          />
          <base-button
            class="password-toggle"
            :aria-label="passwordToggleLabel"
            :disabled="pending"
            :icon="passwordToggleIcon"
            :title="passwordToggleLabel"
            circle
            ghost
            name="password-toggle"
            size="small"
            type="button"
            @click="togglePasswordVisibility"
          />
        </div>
        <nuxt-link to="/password-reset/request">
          {{ $t('login.forgotPassword') }}
        </nuxt-link>
        <base-button :loading="pending" filled name="submit" type="submit" icon="sign-in">
          {{ $t('login.login') }}
        </base-button>
        <p>
          {{ $t('login.no-account') }}
          <nuxt-link to="/registration/signup">{{ $t('login.register') }}</nuxt-link>
        </p>
      </form>
      <template #topMenu>
        <locale-switch offset="5" />
      </template>
    </base-card>
  </section>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

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
      showPassword: false,
    }
  },
  computed: {
    pending() {
      return this.$store.getters['auth/pending']
    },
    passwordInputType() {
      return this.showPassword ? 'text' : 'password'
    },
    passwordToggleIcon() {
      return this.showPassword ? 'eye-slash' : 'eye'
    },
    passwordToggleLabel() {
      return this.showPassword ? this.$t('login.hidePassword') : this.$t('login.showPassword')
    },
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
    },
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

  .base-button {
    display: block;
    width: 100%;
    margin-top: $space-large;
    margin-bottom: $space-small;
  }

  .password-input-wrapper {
    position: relative;

    .ds-form-item {
      margin-bottom: 0;
    }

    .ds-input {
      padding-right: $input-height;
    }

    .password-toggle {
      position: absolute;
      top: 50%;
      right: $space-xxx-small;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: $input-height-small;
      height: $input-height-small;
      margin: 0;
      padding: 0;
      transform: translateY(-50%);
      color: $text-color-softer;

      &:hover,
      &:focus {
        color: $border-color-active;
      }
    }
  }
}
</style>
