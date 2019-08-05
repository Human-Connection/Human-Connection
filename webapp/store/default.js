export const state = () => {
  return {
    showFilterPostsDropdown: false,
    filteredByUsersFollowed: false,
    filteredByCategories: false,
  }
}

export const getters = {
  showFilterPostsDropdown(state) {
    return state.showFilterPostsDropdown || false
  },
  filteredByUsersFollowed(state) {
    return state.filteredByUsersFollowed || false
  },
  filteredByCategories(state) {
    return state.filteredByCategories || false
  },
}

export const mutations = {
  SET_SHOW_FILTER_POSTS_DROPDOWN(state, boolean) {
    state.showFilterPostsDropdown = boolean || null
  },
  SET_FILTERED_BY_FOLLOWERS(state, boolean) {
    state.filteredByUsersFollowed = boolean || null
  },
  SET_FILTERED_BY_CATEGORIES(state, boolean) {
    state.filteredByCategories = boolean || null
  },
}
