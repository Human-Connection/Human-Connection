import gql from 'graphql-tag'

export const state = () => {
  return {
    posts: [],
    filteredByUsersFollowed: false,
    filteredByCategories: false,
    usersFollowedFilter: {},
    categoriesFilter: {},
    selectedCategoryIds: [],
  }
}

export const mutations = {
  SET_POSTS(state, posts) {
    state.posts = posts || null
  },
  SET_FILTERED_BY_FOLLOWERS(state, boolean) {
    state.filteredByUsersFollowed = boolean || null
  },
  SET_FILTERED_BY_CATEGORIES(state, boolean) {
    state.filteredByCategories = boolean || null
  },
  SET_USERS_FOLLOWED_FILTER(state, filter) {
    state.usersFollowedFilter = filter || null
  },
  SET_CATEGORIES_FILTER(state, filter) {
    state.categoriesFilter = filter || null
  },
  SET_SELECTED_CATEGORY_IDS(state, categoryId) {
    if (!categoryId) {
      state.selectedCategoryIds = []
    } else {
      const index = state.selectedCategoryIds.indexOf(categoryId)
      if (index > -1) {
        state.selectedCategoryIds.splice(index, 1)
      } else {
        state.selectedCategoryIds.push(categoryId)
      }
    }
  },
}

export const getters = {
  posts(state) {
    return state.posts || []
  },
  filteredByUsersFollowed(state) {
    return state.filteredByUsersFollowed || false
  },
  filteredByCategories(state) {
    return state.filteredByCategories || false
  },
  usersFollowedFilter(state) {
    return state.usersFollowedFilter || {}
  },
  categoriesFilter(state) {
    return state.categoriesFilter || {}
  },
  selectedCategoryIds(state) {
    return state.selectedCategoryIds || []
  },
}

export const actions = {
  async fetchPosts({ commit, dispatch }, { i18n, filter }) {
    const client = this.app.apolloProvider.defaultClient
    const {
      data: { Post },
    } = await client.query({
      query: gql`
        query Post($filter: _PostFilter, $first: Int, $offset: Int) {
          Post(filter: $filter, first: $first, offset: $offset) {
            id
            title
            contentExcerpt
            createdAt
            disabled
            deleted
            slug
            image
            author {
              id
              avatar
              slug
              name
              disabled
              deleted
              contributionsCount
              shoutedCount
              commentsCount
              followedByCount
              followedByCurrentUser
              location {
                name: name${i18n.locale().toUpperCase()}
              }
              badges {
                id
                icon
              }
            }
            commentsCount
            categories {
              id
              name
              icon
            }
            shoutedCount
          }
      }`,
      variables: {
        filter,
        first: 12,
        offset: 0,
      },
    })
    commit('SET_POSTS', Post)
    return Post
  },
}
