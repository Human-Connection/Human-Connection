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

    const payload = await jwt.verify(token, process.env.JWT_SECRET)
    if (!payload.id) {
      return
    }
    commit('SET_TOKEN', token)
    commit('SET_USER', {
      id: payload.id
    })
    await dispatch('fetchCurrentUser')
  },
  async check({ commit, dispatch, getters }) {
    if (!this.app.$apolloHelpers.getToken()) {
      await dispatch('logout')
    }
    return getters.isLoggedIn
  },
  async fetchCurrentUser({ commit, getters }) {
    await this.app.apolloProvider.defaultClient
      .query({
        query: gql(`
          query User($id: ID!) {
            User(id: $id) {
              id
              name
              slug
              email
              avatar
              role
              locationName
              about
            }
          }
        `),
        variables: { id: getters.user.id }
      })
      .then(({ data }) => {
        const user = data.User.pop()
        if (user.id && user.email) {
          commit('SET_USER', user)
        }
      })
    return getters.user
  },
  async login({ commit }, { email, password }) {
    commit('SET_PENDING', true)
    try {
      const res = await this.app.apolloProvider.defaultClient
        .mutate({
          mutation: gql(`
            mutation($email: String!, $password: String!) {
              login(email: $email, password: $password) {
                id
                name
                slug
                email
                avatar
                role
                locationName
                about
                token
              }
            }
          `),
          variables: { email, password }
        })
        .then(({ data }) => data && data.login)

      await this.app.$apolloHelpers.onLogin(res.token)
      commit('SET_TOKEN', res.token)
      const userData = Object.assign({}, res)
      delete userData.token
      commit('SET_USER', userData)
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
