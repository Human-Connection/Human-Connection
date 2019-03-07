import gql from 'graphql-tag'
import isString from 'lodash/isString'

export const state = () => {
  return {
    quickResults: [],
    quickPending: false,
    quickValue: ''
  }
}

export const mutations = {
  SET_QUICK_RESULTS(state, results) {
    state.quickResults = results || []
    state.quickPending = false
  },
  SET_QUICK_PENDING(state, pending) {
    state.quickPending = pending
  },
  SET_QUICK_VALUE(state, value) {
    state.quickValue = value
  }
}

export const getters = {
  quickResults(state) {
    return state.quickResults
  },
  quickPending(state) {
    return state.quickPending
  },
  quickValue(state) {
    return state.quickValue
  }
}

export const actions = {
  async quickSearch({ commit, getters }, { value }) {
    value = isString(value) ? value.trim() : ''
    const lastVal = getters.quickValue
    if (value.length < 3 || lastVal.toLowerCase() === value.toLowerCase()) {
      return
    }
    commit('SET_QUICK_VALUE', value)
    commit('SET_QUICK_PENDING', true)
    await this.app.apolloProvider.defaultClient
      .query({
        query: gql(`
          query findPosts($filter: String!) {
            findPosts(filter: $filter, limit: 10) {
              id
              slug
              label: title
              value: title,
              shoutedCount
              commentsCount
              createdAt
              author {
                id
                name
                slug
              }
            }
          }
        `),
        variables: {
          filter: value
        }
      })
      .then(res => {
        commit('SET_QUICK_RESULTS', res.data.findPosts || [])
      })
      .catch(() => {
        commit('SET_QUICK_RESULTS', [])
      })
      .finally(() => {
        commit('SET_QUICK_PENDING', false)
      })
    return getters.quickResults
  },
  async quickClear({ commit }) {
    commit('SET_QUICK_PENDING', false)
    commit('SET_QUICK_RESULTS', [])
    commit('SET_QUICK_VALUE', '')
  }
}
