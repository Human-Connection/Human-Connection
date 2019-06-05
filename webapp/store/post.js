export const state = () => {
  return {
    disabled: null,
    id: null,
  }
}
export const mutations = {
  SET_DISABLED_STATE(state, { disabled, id }) {
    console.log(id)
    state.disabled = disabled
    state.id = id
    console.log(state)
  },
}
export const getters = {
  disabled(state) {
    return state.disabled
  },
  id(state) {
    return state.id
  },
}
export const actions = {
  async toggleDisabledState({ getters, commit }, { disabled, id }) {
    console.log(disabled, id)
    commit('SET_DISABLED_STATE', { disabled, id })
  },
}
