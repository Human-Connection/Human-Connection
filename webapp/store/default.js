export const state = () => {
  return {
    showFilterPostsDropdown: false,
  }
}

export const getters = {
  showFilterPostsDropdown(state) {
    return state.showFilterPostsDropdown || false
  },
}

export const mutations = {
  SET_SHOW_FILTER_POSTS_DROPDOWN(state, boolean) {
    state.showFilterPostsDropdown = boolean || null
  },
}
