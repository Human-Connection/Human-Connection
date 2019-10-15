import { storiesOf } from '@storybook/vue'
import { withA11y } from '@storybook/addon-a11y'
import { action } from '@storybook/addon-actions'
import Vuex from 'vuex'
import helpers from '~/storybook/helpers'
import LoginForm from './LoginForm.vue'

helpers.init()

const createStore = ({ loginSuccess }) => {
  return new Vuex.Store({
    modules: {
      auth: {
        namespaced: true,
        state: () => ({
          pending: false,
        }),
        mutations: {
          SET_PENDING(state, pending) {
            state.pending = pending
          },
        },
        getters: {
          pending(state) {
            return !!state.pending
          },
        },
        actions: {
          async login({ commit, dispatch }, args) {
            action('Vuex action `auth/login`')(args)
            return new Promise((resolve, reject) => {
              commit('SET_PENDING', true)
              setTimeout(() => {
                commit('SET_PENDING', false)
                if (loginSuccess) {
                  resolve(loginSuccess)
                } else {
                  reject(new Error('Login unsuccessful'))
                }
              }, 1000)
            })
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
