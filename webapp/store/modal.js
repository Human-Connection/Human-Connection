export const state = () => {
  return {
    open: null,
    data: {},
  }
}

export const mutations = {
  SET_OPEN(state, ctx) {
    state.open = ctx.name || null
    state.data = ctx.data || {}
  },
}

export const getters = {
  open(state) {
    return state.open
  },
  data(state) {
    return state.data
  },
}
