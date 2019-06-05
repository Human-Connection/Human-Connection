export const state = () => {
  return {
    disabled: null,
  }
}
export const mutations = {
  SET_DISABLED_STATE(state, disabled) {
    state.disabled = disabled
  },
}
export const getters = {
  disabled(state) {
    return state.disabled
  },
}
export const actions = {
  async toggleDisabledState({ getters, commit }, { disabled }) {
    commit('SET_DISABLED_STATE', disabled)
  },
}
