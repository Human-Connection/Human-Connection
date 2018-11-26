<template>
  <ds-container width="small">
    <ds-space margin="small">
      <blockquote>
        <p>
          Viele kleine Leute, an vielen kleinen Orten, die viele kleine Dinge tun, werden das Antlitz dieser Welt verändern.
        </p>
        <b>- Afrikanisches Sprichwort</b>
      </blockquote>
    </ds-space>
    <ds-card>
      <ds-flex gutter="small">
        <ds-flex-item
          :width="{ base: '100%', sm: '50%' }"
          center>
          <ds-space
            margin-top="small"
            margin-bottom="xxx-small"
            center>
            <img
              class="login-image"
              src="/img/sign-up/humanconnection.svg"
              alt="Human Connection">
          </ds-space>
        </ds-flex-item>
        <ds-flex-item
          :width="{ base: '100%', sm: '50%' }"
          center>
          <ds-space margin="small">
            <ds-text size="small">Wenn Du ein Konto bei Human Connection hast, melde Dich bitte hier an.</ds-text>
          </ds-space>
          <form
            :disabled="pending"
            @submit.prevent="onSubmit">
            <ds-input
              :disabled="pending"
              v-model="form.email"
              placeholder="Deine E-Mail"
              type="email"
              icon="envelope"/>
            <ds-input
              :disabled="pending"
              v-model="form.password"
              placeholder="Dein Password"
              icon="lock"
              icon-right="question-circle"
              type="password"/>
            <ds-button
              :loading="pending"
              primary
              full-width>
              Anmelden
            </ds-button>
            <ds-space margin="x-small">
              <a
                href="https://human-connection.org"
                title="zur Präsentationsseite"
                target="_blank">Was ist Human Connection?</a>
            </ds-space>
          </form>
        </ds-flex-item>
      </ds-flex>
    </ds-card>
  </ds-container>
</template>

<script>
import gql from 'graphql-tag'

export default {
  layout: 'blank',
  data() {
    return {
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
</style>
