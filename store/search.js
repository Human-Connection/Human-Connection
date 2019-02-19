import gql from 'graphql-tag'

export const state = () => {
  return {
    quickResults: [],
    quickPending: false
  }
}

export const mutations = {
  SET_QUICK_RESULTS(state, results) {
    state.quickResults = results || []
  },
  SET_QUICK_PENDING(state, pending) {
    state.quickPending = pending
  }
}

export const getters = {
  quickResults(state) {
    return state.quickResults
  },
  quickPending(state) {
    return state.quickPending
  }
}

export const actions = {
  async quickSearch({ commit, getters }, { value }) {
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
        commit('SET_QUICK_PENDING', false)
      })
    return getters.quickResults
  },
  async quickClear({ commit }) {
    commit('SET_QUICK_PENDING', false)
    commit('SET_QUICK_RESULTS', [])
  }
}
