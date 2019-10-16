import get from 'lodash/get'
import update from 'lodash/update'
import xor from 'lodash/xor'
import isEmpty from 'lodash/isEmpty'
import isEqual from 'lodash/isEqual'
import clone from 'lodash/clone'

const defaultFilter = {}

export const state = () => {
  return {
    filter: {
      ...defaultFilter,
    },
  }
}

export const mutations = {
  TOGGLE_FILTER_BY_FOLLOWED(state, currentUserId) {
    const filter = clone(state.filter)
    const id = get(filter, 'author.followedBy_some.id')
    if (id) {
      delete filter.author
      state.filter = filter
    } else {
      state.filter = {
        ...filter,
        author: { followedBy_some: { id: currentUserId } },
      }
    }
  },
  RESET_CATEGORIES(state) {
    const filter = clone(state.filter)
    delete filter.categories_some
    state.filter = filter
  },
  TOGGLE_CATEGORY(state, categoryId) {
    const filter = clone(state.filter)
    update(filter, 'categories_some.id_in', categoryIds => xor(categoryIds, [categoryId]))
    if (isEmpty(get(filter, 'categories_some.id_in'))) delete filter.categories_some
    state.filter = filter
  },
  TOGGLE_EMOTION(state, emotion) {
    const filter = clone(state.filter)
    update(filter, 'emotions_some.emotion_in', emotions => xor(emotions, [emotion]))
    if (isEmpty(get(filter, 'emotions_some.emotion_in'))) delete filter.emotions_some
    state.filter = filter
  },
}

export const getters = {
  isActive(state) {
    return !isEqual(state.filter, defaultFilter)
  },
  postsFilter(state) {
    return state.filter
  },
  filteredCategoryIds(state) {
    return get(state.filter, 'categories_some.id_in') || []
  },
  filteredByUsersFollowed(state) {
    return !!get(state.filter, 'author.followedBy_some.id')
  },
  filteredByEmotions(state) {
    return get(state.filter, 'emotions_some.emotion_in') || []
  },
}
