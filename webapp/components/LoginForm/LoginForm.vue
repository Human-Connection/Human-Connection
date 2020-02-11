<template>
  <section class="login-form">
    <blockquote>
      <p>{{ $t('quotes.african.quote') }}</p>
      <b>- {{ $t('quotes.african.author') }}</b>
    </blockquote>
    <card-with-columns>
      <template v-slot:left>
        <locale-switch offset="5" />
        <a :href="$t('login.moreInfoURL')" :title="$t('login.moreInfo')" target="_blank">
          <img class="image" alt="Human Connection" src="/img/sign-up/humanconnection.svg" />
        </a>
      </template>
      <template v-slot:right>
        <form :disabled="pending" @submit.prevent="onSubmit">
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
      </template>
    </card-with-columns>
  </section>
</template>

<script>
import CardWithColumns from '~/components/_new/generic/CardWithColumns/CardWithColumns'
import LocaleSwitch from '~/components/LocaleSwitch/LocaleSwitch'

export default {
  components: {
    CardWithColumns,
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
}

.login-form > .card-with-columns {
  position: relative;

  > .column.--left {
    justify-content: center;
  }

  .v-popover {
    position: absolute;
    top: $space-small;
    left: $space-small;
  }

  .image {
    display: block;
    width: 90%;
    max-width: 200px;
    margin: auto;
  }

  .title {
    margin-bottom: $space-small;
  }

  .password-link {
    display: block;
    margin-bottom: $space-large;
  }

  .base-button {
    display: block;
    width: 100%;
    margin-bottom: $space-small;
  }
}
</style>
