export const state = () => {
  return {
    placeholder: null,
    editPending: false,
  }
}

export const getters = {
  placeholder(state) {
    return state.placeholder
  },
  editPending(state) {
    return state.editPending
  },
}

export const mutations = {
  SET_PLACEHOLDER_TEXT(state, text) {
    state.placeholder = text
  },
  SET_EDIT_PENDING(state, boolean) {
    state.editPending = boolean
  },
}
