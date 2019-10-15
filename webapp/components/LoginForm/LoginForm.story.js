import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import Vue from 'vue'
import Vuex from 'vuex'
import helpers from '~/storybook/helpers'
import LoginForm from './LoginForm.vue'

helpers.init()

const createStore = ({ loginSuccess }) => {
  return new Vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        actions: {
          async login({ commit, dispatch }, args) {
            action('Vuex action `auth/login`')(args)
            if (loginSuccess) {
              return loginSuccess
            } else {
              throw new Error('Login unsuccessful')
            }
          },
        },
      },
    },
  })
}

storiesOf('LoginForm', module)
  .addDecorator(withA11y)
  .addDecorator(helpers.layout)
  .add('successful login', () => {
    return {
      components: { LoginForm },
      store: createStore({ loginSuccess: true }),
      methods: {
        handleSuccess() {
          action('Login successful!')()
        },
      },
      template: `<login-form @success="handleSuccess"/>`,
    }
  })
  .add('unsuccessful login', () => {
    return {
      components: { LoginForm },
      store: createStore({ loginSuccess: false }),
      methods: {
        handleSuccess() {
          action('Login successful!')()
        },
      },
      template: `<login-form @success="handleSuccess"/>`,
    }
  })
