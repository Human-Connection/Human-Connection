import gql from 'graphql-tag'

export const state = () => {
  return {
    categories: null,
    pending: false,
  }
}

export const mutations = {
  SET_CATEGORIES(state, categories) {
    state.categories = categories || null
  },
  SET_PENDING(state, pending) {
    state.pending = pending
  },
}

export const getters = {
  categories(state) {
    return state.categories || []
  },
}

export const actions = {
  async fetchCategories({ commit }) {
    const client = this.app.apolloProvider.defaultClient
    const {
      data: { Category },
    } = await client.query({
      query: gql(`{
          Category {
            id
            name
            icon
          }
      }`),
    })
    commit('SET_CATEGORIES', Category)
    return Category
  },
}
