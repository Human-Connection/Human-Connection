<template>
  <transition
    name="fade"
    appear
  >
    <ds-container
      v-if="ready"
      width="small"
    >
      <ds-space margin="small">
        <blockquote>
          <p>{{ $t('quotes.african.quote') }}</p>
          <b>- {{ $t('quotes.african.author') }}</b>
        </blockquote>
      </ds-space>
      <ds-card class="login-card">
        <ds-flex gutter="small">
          <ds-flex-item
            :width="{ base: '100%', sm: '50%' }"
            center
          >
            <locale-switch class="login-locale-switch" />
            <ds-space
              margin-top="small"
              margin-bottom="xxx-small"
              center
            >
              <img
                class="login-image"
                src="/img/sign-up/humanconnection.svg"
                alt="Human Connection"
              >
            </ds-space>
          </ds-flex-item>
          <ds-flex-item
            :width="{ base: '100%', sm: '50%' }"
            center
          >
            <ds-space margin="small">
              <ds-text size="small">
                {{ $t('login.copy') }}
              </ds-text>
            </ds-space>
            <form
              :disabled="pending"
              @submit.prevent="onSubmit"
            >
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
              <ds-button
                :loading="pending"
                primary
                full-width
                name="submit"
                type="submit"
                icon="sign-in"
              >
                {{ $t('login.login') }}
              </ds-button>
              <ds-space margin="x-small">
                <a
                  href="https://human-connection.org"
                  title="zur Präsentationsseite"
                  target="_blank"
                >
                  {{ $t('login.moreInfo') }}
                </a>
              </ds-space>
            </form>
          </ds-flex-item>
        </ds-flex>
      </ds-card>
    </ds-container>
  </transition>
</template>

<script>
import LocaleSwitch from '~/components/LocaleSwitch'

import gql from 'graphql-tag'

export default {
  components: {
    LocaleSwitch
  },
  layout: 'blank',
  data() {
    return {
      ready: false,
      form: {
        email: '',
        password: ''
      }
    }
  },
  asyncData({ store, redirect }) {
    if (store.getters['auth/isLoggedIn']) {
      redirect('/')
    }
  },
  computed: {
    pending() {
      return this.$store.getters['auth/pending']
    }
  },
  mounted() {
    setTimeout(() => {
      // NOTE: quick fix for jumping flexbox implementation
      // will be fixed in a future update of the styleguide
      this.ready = true
    }, 50)
  },
  methods: {
    async onSubmit() {
      try {
        await this.$store.dispatch('auth/login', { ...this.form })
        this.$toast.success('You are logged in!')
        this.$router.replace(this.$route.query.path || '/')
      } catch (err) {
        this.$toast.error(err.message)
      }
    }
  }
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
