export const state = () => {
  return {
    searchValue: '',
  }
}

export const mutations = {
  SET_VALUE(state, ctx) {
    state.searchValue = ctx.searchValue || ''
  },
}

export const getters = {
  searchValue(state) {
    return state.searchValue
  },
}
