export const state = () => {
  return {
    placeholder: null,
  }
}

export const getters = {
  placeholder(state) {
    return state.placeholder
  },
}

export const mutations = {
  SET_PLACEHOLDER_TEXT(state, text) {
    state.placeholder = text
  },
}
