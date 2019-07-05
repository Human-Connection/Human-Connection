export const state = () => {
  return {
    posts: [],
  }
}

export const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts || null
  },
}

export const getters = {
  posts(state) {
    return state.posts || []
  },
}
