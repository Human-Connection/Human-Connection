import gql from 'graphql-tag'

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

export const actions = {
  async fetchPosts({ commit, dispatch }, { i18n, filter }) {
    const client = this.app.apolloProvider.defaultClient
    const {
      data: { Post },
    } = await client.query({
      query: gql(`
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
      }`),
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
