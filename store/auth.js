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
  async init({ commit }) {
    if (process.client) {
      return
    }
    const token = this.app.$apolloHelpers.getToken()
    if (!token) {
      return
    }

    const user = await jwt.verify(token, 'b/&&7b78BF&fv/Vd')
    if (user.id) {
      commit('SET_USER', {
        id: user.id,
        name: user.name,
        slug: user.slug,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      })
      commit('SET_TOKEN', token)
    }
  },
  async check({ commit, dispatch, getters }) {
    if (!this.app.$apolloHelpers.getToken()) {
      await dispatch('logout')
    }
    return getters.isLoggedIn
  },
  async login({ commit }, { email, password }) {
    try {
      commit('SET_PENDING', true)
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
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
              token
            }
          }
        `),
          variables: { email, password }
        })
        .then(({ data }) => data && data.login)

      if (res && res.token) {
        await this.app.$apolloHelpers.onLogin(res.token)
        commit('SET_TOKEN', res.token)
        const userData = Object.assign({}, res)
        delete userData.token
        commit('SET_USER', userData)
        commit('SET_PENDING', false)
        return true
      } else {
        commit('SET_PENDING', false)
        throw new Error('THERE IS AN ERROR')
      }
    } catch (err) {
      commit('SET_USER', null)
      commit('SET_TOKEN', null)
      commit('SET_PENDING', false)
      throw new Error(err)
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
