import gql from 'graphql-tag'
import jwt from 'jsonwebtoken'

export const state = () => {
  return {
    user: null,
    token: null,
    pending: false
  }
}

export const mutations = {
  SET_USER(state, user) {
    state.user = user || null
  },
  SET_TOKEN(state, token) {
    state.token = token || null
  },
  SET_PENDING(state, pending) {
    state.pending = pending
  }
}

export const getters = {
  isAuthenticated(state) {
    return !!state.token
  },
  isLoggedIn(state) {
    return !!(state.user && state.token)
  },
  pending(state) {
    return !!state.pending
  },
  isAdmin(state) {
    return !!state.user && state.user.role === 'admin'
  },
  isModerator(state) {
    return (
      !!state.user &&
      (state.user.role === 'admin' || state.user.role === 'moderator')
    )
  },
  user(state) {
    return state.user || {}
  },
  token(state) {
    return state.token
  }
}

export const actions = {
  async init({ commit, dispatch }) {
    if (!process.server) {
      return
    }
    const token = this.app.$apolloHelpers.getToken()
    if (!token) {
      return
    }
    commit('SET_TOKEN', token)
    await dispatch('fetchCurrentUser')
  },

  async check({ commit, dispatch, getters }) {
    if (!this.app.$apolloHelpers.getToken()) {
      await dispatch('logout')
    }
    return getters.isLoggedIn
  },
  async fetchCurrentUser({ commit }) {
    const client = this.app.apolloProvider.defaultClient
    const {
      data: { currentUser }
    } = await client.query({
      query: gql(`{
          currentUser {
            id
            name
            slug
            email
            avatar
            role
          }
        }`)
    })
    const { token, ...user } = currentUser
    commit('SET_USER', user)
    return user
  },
  async login({ commit }, { email, password }) {
    commit('SET_PENDING', true)
    try {
      const client = this.app.apolloProvider.defaultClient
      const {
        data: { login }
      } = await client.mutate({
        mutation: gql(`
            mutation($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                id
                name
                slug
                email
                avatar
                role
                token
              }
            }
          `),
        variables: { email, password }
      })
      const { token, ...user } = login

      await this.app.$apolloHelpers.onLogin(token)
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    } catch (err) {
      throw new Error(err)
    } finally {
      commit('SET_PENDING', false)
    }
  },
  async logout({ commit }) {
    commit('SET_USER', null)
    commit('SET_TOKEN', null)
    return this.app.$apolloHelpers.onLogout()
  },
  register(
    { dispatch, commit },
    { email, password, inviteCode, invitedByUserId }
  ) {},
  async patch({ state, commit, dispatch }, data) {},
  resendVerifySignup({ state, dispatch }) {},
  resetPassword({ state }, data) {},
  setNewPassword({ state }, data) {}
}
